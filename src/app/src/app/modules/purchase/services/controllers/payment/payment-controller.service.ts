import { Injectable } from '@angular/core';
import { INewCard } from '@app/interfaces';
import { PAYMENT_METHOD } from '@app/modules/purchase/constants/payment-method.constants';
import { IMsgCollapsableBox } from '@app/modules/purchase/interfaces/msg-collapsable-box.interface';
import {
  CartsService,
  CountryService,
  EventService,
  LoaderService,
  LoggerService,
  PurchaseService,
  StorageService,
  TextService,
  TrackingConstants,
  UserService,
} from '@app/services';
import { PopupService } from '@app/services/popup';
import { CheckoutAnalyticsService } from '../../analytics/analytics.service';
import { CheckoutService } from '../../checkout/checkout.service';
import { CheckoutCommonService } from '../../common/common.service';
import { CheckoutGroupOrderService } from '../../group-order/group-order.service';
import {
  CheckoutPaymentCardService,
  CheckoutPaymentCommonService,
  CheckoutPaymentIdealService,
  CheckoutPaymentKlarnaService,
  CheckoutPaymentPaypalService,
} from '../../payment';
import { CheckoutStoreService } from '../../store/checkout-store.service';

@Injectable()
export class CheckoutPaymentControllerService extends CheckoutCommonService {
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
    private countrySrv: CountryService,
    private checkoutSrv: CheckoutService,
    private checkoutAnalyticsSrv: CheckoutAnalyticsService,
    private checkoutGroupOrderSrv: CheckoutGroupOrderService,
    private checkoutPaymentPayPalSrv: CheckoutPaymentPaypalService,
    private checkoutPaymentCardSrv: CheckoutPaymentCardService,
    private checkoutPaymentIdealSrv: CheckoutPaymentIdealService,
    private checkoutPaymentKlarnaSrv: CheckoutPaymentKlarnaService,
    private checkoutPaymentCommonSrv: CheckoutPaymentCommonService
  ) {
    super(loaderSrv, eventSrv, userService, purchaseSrv, cartsSrv, popupSrv, textSrv, loggerSrv, storageSrv, checkoutStoreSrv);
  }

  async payCart(
    { stripeIntent }: { stripeIntent: stripe.paymentIntents.PaymentIntent },
    shipperMsg: IMsgCollapsableBox,
    dedicatoryMsg: IMsgCollapsableBox
  ): Promise<void> {
    this.setInnerLoader(true, true);

    const { selectedPaymentMethod } = this.checkoutStoreSrv;

    try {
      this.checkoutStoreSrv.isGroupOrder
        ? await this._payCartAsGroupOrder(selectedPaymentMethod.source.id, selectedPaymentMethod.type)
        : await this._payCartDefault(stripeIntent, shipperMsg, dedicatoryMsg);
    } catch (err) {
      this.storageSrv.clear('lastPayment');
      this.displayGenericPopUp('stripe-error', err?.displayErrorMessage);
      this.logError(err);
      this.setInnerLoader(false, false);
      this.checkoutAnalyticsSrv.trackGA4Analytics(TrackingConstants.GTM4.CHECKOUT_KO_CODE);
    } finally {
      selectedPaymentMethod.type !== PAYMENT_METHOD.PAYPAL && this.setInnerLoader(false, false);
    }
  }

  async payWithNewCard(params: INewCard): Promise<void> {
    this.setInnerLoader(true, true);

    try {
      this.checkoutStoreSrv.isGroupOrder
        ? await this.checkoutGroupOrderSrv.addPaymentMethodAndPayCart(params.data)
        : await this._addAndPayCardByDefault(params);
    } catch (err) {
      this.displayGenericPopUp('stripe-error', err?.displayErrorMessage);
      this.logError(err);
      this.checkoutAnalyticsSrv.trackGA4Analytics(TrackingConstants.GTM4.CHECKOUT_KO_CODE);
    } finally {
      this.setInnerLoader(false, false);
    }
  }

  async payWithNewPayPal(shipperMsg: IMsgCollapsableBox, dedicatoryMsg: IMsgCollapsableBox): Promise<void> {
    this.setInnerLoader(true, true);

    try {
      this.checkoutStoreSrv.isGroupOrder
        ? await this._addAndPayPaypalAsGroupOrder()
        : await this._addAndPayPaypalByDefault(shipperMsg, dedicatoryMsg);
    } catch (err) {
      this.storageSrv.clear('lastPayment');
      this.displayGenericPopUp('stripe-error', err?.displayErrorMessage);
      this.logError(err);
      this.setInnerLoader(false, false);
      this.checkoutAnalyticsSrv.trackGA4Analytics(TrackingConstants.GTM4.CHECKOUT_KO_CODE);
    }
  }

  async payWithKlarna(shipperMsg: IMsgCollapsableBox, dedicatoryMsg: IMsgCollapsableBox): Promise<void> {
    this.setInnerLoader(true, true);

    try {
      const currentCountry = this.countrySrv.getCurrentCountry();

      this.checkoutSrv.handleOrderMsgs(shipperMsg, dedicatoryMsg);
      this.checkoutAnalyticsSrv.trackProductsAnalytics('4');
      this.checkoutSrv.saveOrderDataBeforeRedirect();
      await this.checkoutPaymentKlarnaSrv.handlePayment(currentCountry.currency);
    } catch (err) {
      this.storageSrv.clear('lastPayment');
      this.displayGenericPopUp('stripe-error', err?.displayErrorMessage);
      this.logError(err);
      this.setInnerLoader(false, false);
      this.checkoutAnalyticsSrv.trackGA4Analytics(TrackingConstants.GTM4.CHECKOUT_KO_CODE);
    }
  }

  private async _payCartAsGroupOrder(id: string, type: PAYMENT_METHOD): Promise<void> {
    await this.checkoutGroupOrderSrv.payCart(id, type);
  }

  private async _payCartDefault(
    stripeIntent: stripe.paymentIntents.PaymentIntent,
    shipperMsg: IMsgCollapsableBox,
    dedicatoryMsg: IMsgCollapsableBox
  ): Promise<void> {
    this.checkoutSrv.handleOrderMsgs(shipperMsg, dedicatoryMsg);
    this.checkoutAnalyticsSrv.trackProductsAnalytics('4');

    if (this.checkoutStoreSrv.finalPrice <= 0) {
      await this._creditsFullPayment();
    } else {
      if (this.checkoutStoreSrv.selectedPaymentMethod.type === PAYMENT_METHOD.PAYPAL) {
        this.checkoutSrv.saveOrderDataBeforeRedirect();
        await this.checkoutPaymentPayPalSrv.pay(stripeIntent);
      } else {
        const paymentId = await this._getPaymentId(stripeIntent);

        paymentId && this.checkoutPaymentCommonSrv.onPaymentSuccess();
      }
    }
  }

  private async _creditsFullPayment(): Promise<void> {
    const paymentId = await this.checkoutPaymentCommonSrv.createOrder();

    paymentId && this.checkoutPaymentCommonSrv.onPaymentSuccess();
  }

  private async _getPaymentId(stripeIntent: stripe.paymentIntents.PaymentIntent): Promise<string> {
    let paymentId: string;
    const { type } = this.checkoutStoreSrv.selectedPaymentMethodFullValue;

    if (type === PAYMENT_METHOD.CARD) {
      paymentId = await this.checkoutPaymentCardSrv.createOrder(stripeIntent);
    } else if (type === PAYMENT_METHOD.IDEAL) {
      paymentId = await this.checkoutPaymentIdealSrv.createOrder(stripeIntent);
    } else {
      paymentId = await this.checkoutPaymentCommonSrv.createOrder();
    }

    return paymentId;
  }

  private async _addAndPayCardByDefault(params: INewCard): Promise<void> {
    const paymentIntent = await this.checkoutPaymentCardSrv.addAndPay(params);

    await this._handleNewCardPaymentIntent(params, paymentIntent);
  }

  private async _handleNewCardPaymentIntent(params: INewCard, paymentIntent: any): Promise<void> {
    const paymentId = await this.checkoutPaymentCardSrv.getNewCardPaymentId(params, paymentIntent);

    paymentId && this.checkoutPaymentCommonSrv.onPaymentSuccess();
  }

  private async _addAndPayPaypalAsGroupOrder(): Promise<void> {
    const paymentMethodId = await this.checkoutPaymentPayPalSrv.createPaymentMethod();

    await this._payCartAsGroupOrder(paymentMethodId, PAYMENT_METHOD.PAYPAL);
  }

  private async _addAndPayPaypalByDefault(shipperMsg: IMsgCollapsableBox, dedicatoryMsg: IMsgCollapsableBox): Promise<void> {
    const currentCountry = this.countrySrv.getCurrentCountry();

    this.checkoutSrv.handleOrderMsgs(shipperMsg, dedicatoryMsg);
    this.checkoutAnalyticsSrv.trackProductsAnalytics('4');
    this.checkoutSrv.saveOrderDataBeforeRedirect();
    await this.checkoutPaymentPayPalSrv.createPaymentMethodAndPay(currentCountry.currency);
  }
}
