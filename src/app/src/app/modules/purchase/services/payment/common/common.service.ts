/// <reference types="stripe-v3" />
import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import {
  IPaymentMethodMapToElem,
  IUserPaymentMethodCard,
  StripePaymentMethodsInterface,
} from '../../../../../interfaces/payment-method.interface';
import {
  CartsService,
  LoggerService,
  PurchaseService,
  RouterService,
  StorageService,
  StripeService,
  TextService,
  UserService,
} from '../../../../../services';
import { PopupService } from '../../../../../services/popup';
import { IAddress, UnknownObjectType, IStorageLastPayment, UserInterface } from '../../../../../interfaces';
import { PAYMENT_METHOD } from '../../../constants/payment-method.constants';
import { IOrder } from '../../../interfaces/order.interface';
import { CheckoutStoreService } from '../../store/checkout-store.service';
import { CheckoutCommonService } from '../../common/common.service';
import { EventService, LoaderService } from '../../../../../services';
import * as dayjs from 'dayjs';
import { CheckoutNavigationService } from '../../navigation/navigation.service';
import { PurchaseError } from '@app/modules/purchase/models/error.model';

@Injectable()
export class CheckoutPaymentCommonService extends CheckoutCommonService {
  private stripe: any;

  public stripeIntentStatuses = {
    reqConfirmation: 'requires_confirmation',
    reqAction: 'requires_action',
    reqPaymentMethod: 'requires_payment_method',
    reqCapture: 'requires_capture',
    succeeded: 'succeeded',
  };

  constructor(
    public loaderSrv: LoaderService,
    public eventSrv: EventService,
    public userService: UserService,
    public purchaseSrv: PurchaseService,
    public cartsSrv: CartsService,
    public popupSrv: PopupService,
    public textSrv: TextService,
    public loggerSrv: LoggerService,
    public storageSrv: StorageService,
    public checkoutStoreSrv: CheckoutStoreService,
    private cartSrv: CartsService,
    private userSrv: UserService,
    private stripeSrv: StripeService,
    private translocoSrv: TranslocoService,
    private routerSrv: RouterService,
    private navigationSrv: CheckoutNavigationService
  ) {
    super(loaderSrv, eventSrv, userService, purchaseSrv, cartsSrv, popupSrv, textSrv, loggerSrv, storageSrv, checkoutStoreSrv);
  }

  getStripe(): any {
    return this.stripe;
  }

  setStripe(stripe: any): void {
    this.stripe = stripe;
  }

  hasStripe(): boolean {
    return !!this.stripe;
  }

  generateButtonId(): string {
    return new Date().getTime().toString();
  }

  onRemovePaymentMethod(paymentMethods: StripePaymentMethodsInterface, sourceId: string): void {
    const user = { ...this.checkoutStoreSrv.user, paymentMethods: [paymentMethods] };

    this.userSrv.setOnStorage(user);
    this.checkoutStoreSrv.setUser(user);
    this.setPaymentMethods();
    if (this.checkoutStoreSrv.selectedPaymentMethod?.source?.id === sourceId) {
      this.checkoutStoreSrv.setSelectedPaymentMethod(null);
    }
  }

  setPaymentMethods(methodId: string = this.checkoutStoreSrv.selectedPaymentMethod?.source?.id): void {
    const availablePaymentMethods = this._paymentMethodsMapTo(this.checkoutStoreSrv.user);

    this.checkoutStoreSrv.setAvailablePaymentMethods(availablePaymentMethods);
    const matchSelectedPaymentMethod = availablePaymentMethods.find((elem) => elem.source.id === methodId);

    this.checkoutStoreSrv.setSelectedPaymentMethod(
      methodId && matchSelectedPaymentMethod ? { type: matchSelectedPaymentMethod.type, source: matchSelectedPaymentMethod.source } : null
    );
  }

  async createOrder(): Promise<string> {
    const cart = await this.getCartAndValidate(this.checkoutStoreSrv.currentIso);
    const selectedPaymentMethod = this.checkoutStoreSrv.selectedPaymentMethodFullValue;
    const paymentId = await this.generateOrder(cart, selectedPaymentMethod);

    return paymentId;
  }

  async generateOrder(cart: any, orderPaymentMethod: any = {}, buttonId: string = this.generateButtonId()): Promise<string> {
    const shipperMsg = this.checkoutStoreSrv.shipperMsg;
    const dedicatoryMsg = this.checkoutStoreSrv.dedicatoryMsg;
    const tabId = this.storageSrv.get('tabId', 2);
    const orderData = this.getOrderData(
      cart,
      this.checkoutStoreSrv.getSelectedUserAddress(),
      orderPaymentMethod,
      shipperMsg,
      dedicatoryMsg
    );

    orderData.extra = {};

    if (buttonId) {
      orderData.extra.buttonId = buttonId;
    }

    if (tabId) {
      orderData.extra.tabId = tabId;
    }

    if (orderPaymentMethod?.type === PAYMENT_METHOD.PAYPAL) {
      this._logPaypalIntentBeforePurchase(orderData);
    }

    this._logStartPurchase(orderPaymentMethod?.type, orderData);

    try {
      const orderResult: any = await this.purchaseSrv.order(orderData);

      this.saveLastPayment(cart, orderResult);
      this.saveE2ePurchaseIdOnSessionStorage(orderData, orderResult);

      return orderResult.payment._id as string;
    } catch (err) {
      const purchaseErrorMsg = await this._getPurchaseErrorMsg(err);

      if (err.code !== 412) {
        const products = this.checkoutStoreSrv.products.map((product) => ({
          price: product.price,
          type: product.type,
          _masterBox: product._masterBox,
          _up: product._up,
          ...(product._uberUp && { _uberUp: product._uberUp }),
          ...(product._upCf && { _upCf: product._upCf }),
        }));

        const paymentMethod = {
          price: orderData.price,
          type: orderData.paymentMethod?.type,
          intentAmount: orderData.paymentMethod?.intent?.amount,
        };

        throw new PurchaseError({
          name: 'ORDER_ERROR',
          message: 'Generate order error',
          cause: err,
          displayErrorMessage: purchaseErrorMsg,
          data: {
            products,
            paymentMethod,
            countryIso: this.checkoutStoreSrv.currentIso,
            currency: this.checkoutStoreSrv.currentCurrency,
          },
        });
      }
    }
  }

  getPurchaseData(cart: UnknownObjectType[]): IOrder {
    const address = this.checkoutStoreSrv.getSelectedUserAddress();
    const { selectedPaymentMethodFullValue, shipperMsg, dedicatoryMsg } = this.checkoutStoreSrv;
    const purchaseData = this.getOrderData(cart, address, selectedPaymentMethodFullValue, shipperMsg, dedicatoryMsg);

    return purchaseData;
  }

  getOrderData(cart: any, address: IAddress, paymentMethod: any, shipperMsg: string | null, dedicatoryMsg: string | null): IOrder {
    const orderData: IOrder = { cart, address, paymentMethod, price: this.checkoutStoreSrv.finalPrice, allowCredits: true };

    if (this.checkoutStoreSrv.finalPrice <= 0) {
      orderData.paymentMethod = {
        type: PAYMENT_METHOD.CREDITS,
        intent: {
          amount: this.checkoutStoreSrv.price,
        },
      };
    }

    if (shipperMsg) {
      orderData.shipperMessage = shipperMsg;
    }

    if (dedicatoryMsg) {
      orderData.dedicatoryMsg = dedicatoryMsg;
    }

    if (orderData.address.hasOwnProperty('addressId')) {
      if (orderData.address.addressId) {
        orderData.address.id = orderData.address.addressId;
      }
    }

    if ((orderData.address.id || orderData.address.id === 0) && (orderData.address.id as string).length !== 24) {
      delete orderData.address.id;
    }

    delete orderData.address.addressId;

    return orderData;
  }

  saveE2ePurchaseIdOnSessionStorage(orderData: IOrder, orderResult: any): void {
    try {
      for (let i = 0; i < orderData.cart.length; i++) {
        const e2ePurchaseId =
          (orderData.paymentMethod.intent ? orderData.paymentMethod.intent.id : orderResult.orders[i]._id.toString()) +
          orderData.cart[i].up;

        this.storageSrv.set(`e2ePurchaseId${i}`, e2ePurchaseId, 0, false, 2);
      }
    } catch (error) {
      console.error(error);
    }
  }

  logMissingQueryparams(callbackUrl: string): void {
    this.logInfo(PAYMENT_METHOD.PAYPAL, 'Comes from callback but missing "payment_intent" and "payment_intent_client_secret" queryparams', {
      callbackUrl,
    });
  }

  logPaypalCallback(paymentIntentID: string, callbackUrl: string): void {
    this.logInfo(PAYMENT_METHOD.PAYPAL, 'Callback log', { paymentIntentID, callbackUrl });
  }

  getStripeShippingDetails(): stripe.ShippingDetails {
    const { isGroupOrderGuestPaymentMode, purchaseInfo } = this.checkoutStoreSrv;

    return this.stripeSrv.toStripeShippingDetails(
      isGroupOrderGuestPaymentMode ? purchaseInfo.cart.address : this.checkoutStoreSrv.getSelectedUserAddress()
    );
  }

  getPurchaseCart(): any {
    if (this.checkoutStoreSrv.isGroupOrder) {
      if (this.checkoutStoreSrv.isGroupOrderGuestPaymentMode) {
        return this.checkoutStoreSrv.purchaseInfo.cart.items;
      }

      return this.checkoutStoreSrv.cart.items;
    } else {
      return this.purchaseSrv.formatCart(this.cartSrv.get());
    }
  }

  onPaymentSuccess(): void {
    this.cartsSrv.clear();
    this.cartsSrv.update([], 'etc');
    this.routerSrv.navigate('order/order-ok');
  }

  private _paymentMethodsMapTo(user: UserInterface): IPaymentMethodMapToElem[] {
    if (user && user.paymentMethods && user.paymentMethods[0]) {
      const paymentMethods = user.paymentMethods[0];
      const methods = ['cards'];

      if (this.checkoutStoreSrv.isIdealAllowed) {
        methods.push('ideals');
      }

      if (this.checkoutStoreSrv.isSepaAllowed) {
        methods.push('sepas');
      }

      if (this.checkoutStoreSrv.isPaypalAllowed) {
        methods.push('paypals');
      }

      if (paymentMethods.cards) {
        paymentMethods.cards = this._removeExpiredCards(paymentMethods.cards);
      }

      const mapTo = methods.map((methodName) => {
        if (paymentMethods[methodName]) {
          return paymentMethods[methodName]
            .filter((elem) => !elem.banned)
            .map((method) => ({
              ...method,
              type: methodName.slice(0, -1),
              source: method[`${methodName.slice(0, -1)}Info`],
            }))
            .map((method) => {
              delete method[method.type + 'Info'];

              return method;
            });
        }
      });

      return [].concat(...mapTo).filter((elem) => !!elem);
    }

    return [];
  }

  private _removeExpiredCards(paymentMethodsCards: IUserPaymentMethodCard[]): IUserPaymentMethodCard[] {
    return paymentMethodsCards.filter((elem) => {
      const date = dayjs
        .utc()
        .month(elem.cardInfo.exp_month - 1)
        .year(elem.cardInfo.exp_year);

      if (!date.isBefore(dayjs.utc())) {
        return elem;
      }
    });
  }

  private _logPaypalIntentBeforePurchase(orderData: IOrder): void {
    this.logInfo(PAYMENT_METHOD.PAYPAL, 'Intent before purchase', {
      paymentIntentID: orderData?.paymentMethod?.intent?.id || null,
      paymentIntentStatus: orderData?.paymentMethod?.intent?.status || null,
    });
  }

  private _logStartPurchase(paymentMethodType: PAYMENT_METHOD, orderData: IOrder): void {
    this.logInfo(paymentMethodType, 'Start purchase', {
      price: this.checkoutStoreSrv.finalPrice,
      paymentIntentID: orderData.paymentMethod?.intent?.id || null,
      paymentIntentStatus: orderData.paymentMethod?.intent?.status || null,
      tabId: orderData.extra.tabId || null,
      buttonId: orderData.extra.buttonId || null,
    });
  }

  private async _getPurchaseErrorMsg(err: UnknownObjectType): Promise<string> {
    let msg = '';

    if (err.code === 412 && err.data?.errorItems) {
      const { errorItems } = err.data;
      const errorItemsUpMap = [...new Set(errorItems.map((elem) => elem.up))] as string[];

      this._logProductNotAvailable(errorItemsUpMap);
      this.checkoutStoreSrv.setPurchaseErrorItems(errorItemsUpMap);

      await this.navigationSrv.navToCheckoutSection(0);

      msg = this.translocoSrv.translate('global.some-products-not-available.text-info');
    } else {
      const error = err.msg || err.error?.msg;
      const code = err.code || err.error?.code;

      if (code === 403) {
        msg = this.textSrv.getText('Payment method not authorized');
      } else {
        msg = this.textSrv.getText([420, 400].includes(code) && error ? error : 'Operation not available');
      }
    }

    return msg;
  }

  private _logProductNotAvailable(products: string[]): void {
    this.logInfo('Product', 'Not available', { products });
  }
}
