import { Injectable } from '@angular/core';
import { CurrencyType } from '@app/constants/app.constants';
import { IStorageLastPayment } from '@app/interfaces';
import { PAYMENT_METHOD } from '@app/modules/purchase/constants/payment-method.constants';
import { PurchaseError } from '@app/modules/purchase/models/error.model';
import {
  CartsService,
  EventService,
  LoaderService,
  LoggerService,
  PurchaseService,
  StorageService,
  StripeService,
  TextService,
  UserService,
} from '@app/services';
import { PopupService } from '@app/services/popup';
import { CheckoutCommonService } from '../../common/common.service';
import { CheckoutStoreService } from '../../store/checkout-store.service';
import { CheckoutPaymentCommonService } from '../common/common.service';

@Injectable()
export class CheckoutPaymentKlarnaService extends CheckoutCommonService {
  get stripe(): any {
    return this.checkoutPaymentCommonSrv.getStripe();
  }

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
    private checkoutPaymentCommonSrv: CheckoutPaymentCommonService,
    private stripeSrv: StripeService
  ) {
    super(loaderSrv, eventSrv, userService, purchaseSrv, cartsSrv, popupSrv, textSrv, loggerSrv, storageSrv, checkoutStoreSrv);
  }

  async handlePayment(currency: CurrencyType): Promise<void> {
    const buttonId = this.checkoutPaymentCommonSrv.generateButtonId();

    const { id } = await this._createPaymentMethod();

    if (id) {
      const stripeIntent = await this._getStripeIntent(currency, id);

      this.checkoutStoreSrv.setLastPaymentIntent(stripeIntent);
      await this._confirmPaymentIntent(stripeIntent, buttonId);
    } else {
      throw new PurchaseError({
        name: 'KLARNA_ERROR',
        message: `${PAYMENT_METHOD.KLARNA} error creating payment method id`,
      });
    }
  }

  private async _createPaymentMethod(): Promise<any> {
    const userAddress = this.checkoutStoreSrv.getSelectedUserAddress();

    const paymentMethod = await this.stripeSrv.createPaymentMethod({
      card: {},
      type: PAYMENT_METHOD.KLARNA,
      billing_details: {
        ...this._getKlarnaShippingDetails(),
        email: this.checkoutStoreSrv.user.email,
        phone: `${userAddress.phone.prefix}${userAddress.phone.number}`,
      },
    });

    return paymentMethod;
  }

  private async _getStripeIntent(currency: CurrencyType, paymentMethodId: string): Promise<stripe.paymentIntents.PaymentIntent> {
    const intent: stripe.paymentIntents.PaymentIntent = await this.stripeSrv.getIntent({
      method: paymentMethodId,
      amount: this.checkoutStoreSrv.finalPrice,
      currency: currency.toLowerCase(),
      customer: this.checkoutStoreSrv.user.paymentMethods[0].id,
      methodTypes: PAYMENT_METHOD.KLARNA,
      shipping: this.checkoutPaymentCommonSrv.getStripeShippingDetails(),
      platform: 'web',
    });

    return intent;
  }

  private async _confirmPaymentIntent(stripeIntent: stripe.paymentIntents.PaymentIntent, buttonId: string): Promise<void> {
    const cart = await this.checkoutPaymentCommonSrv.getCartAndValidate(this.checkoutStoreSrv.currentIso);
    const purchaseData = this.checkoutPaymentCommonSrv.getPurchaseData(cart);

    const { url } = await this.stripeSrv.confirmPaymentMethod({
      id: stripeIntent.id,
      paymentMethod: stripeIntent.payment_method,
      url: this._getCallbackUrl(buttonId),
      purchaseData,
    }, 'klarna');

    if (url) {
      this.saveLastPayment(cart);
      this.checkoutPaymentCommonSrv.logInfo(PAYMENT_METHOD.KLARNA, 'Redirect to external url', { url });

      window.location.href = url;
    } else {
      throw new PurchaseError({
        name: 'KLARNA_ERROR',
        message: `${PAYMENT_METHOD.KLARNA} no callback url on confirm`,
        data: {
          stripeIntent,
        },
      });
    }
  }

  private _getCallbackUrl(buttonId: string): string {
    const path = window.location.href;

    return `${path}&payment_type=${PAYMENT_METHOD.KLARNA}&button_id=${buttonId}`;
  }

  private _getKlarnaShippingDetails(): stripe.ShippingDetails {
    const stripeShippingDetails = this.checkoutPaymentCommonSrv.getStripeShippingDetails();
    const address = stripeShippingDetails.address;
    const { line1, line2 } = stripeShippingDetails.address;
    const klarnaAddress = `${line1} ${line2 || ''}`;

    return {
      ...stripeShippingDetails,
      address: {
        ...address,
        line1: klarnaAddress.trim(),
      },
    };
  }
}
