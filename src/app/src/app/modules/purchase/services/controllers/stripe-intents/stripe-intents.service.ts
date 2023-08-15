import { Injectable } from '@angular/core';
import { CurrencyType } from '@app/constants/app.constants';
import { IPaymentMethodMapToElem } from '@app/interfaces';
import { PAYMENT_METHOD } from '@app/modules/purchase/constants/payment-method.constants';
import { PurchaseError } from '@app/modules/purchase/models/error.model';
import { StatusPopupComponent } from '@app/popups/status-popup';
import {
  CartsService,
  CountryService,
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
import { CheckoutPaymentCommonService } from '../../payment';
import { CheckoutStoreService } from '../../store/checkout-store.service';

@Injectable()
export class CheckoutStripeIntentsControllerService extends CheckoutCommonService {
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
    private stripeSrv: StripeService,
    private countrySrv: CountryService,
    private checkoutPaymentCommonSrv: CheckoutPaymentCommonService
  ) {
    super(loaderSrv, eventSrv, userService, purchaseSrv, cartsSrv, popupSrv, textSrv, loggerSrv, storageSrv, checkoutStoreSrv);
  }

  async handleStripeIntent(
    id: string,
    availablePaymentMethods: IPaymentMethodMapToElem[],
    showPopupAfterStripeIntent: boolean,
    showLoader: boolean = true
  ): Promise<stripe.paymentIntents.PaymentIntent> {
    try {
      const stripeIntent = await this._getStripeIntent(id, availablePaymentMethods, showPopupAfterStripeIntent, showLoader);

      return stripeIntent;
    } catch (err) {
      this.checkoutStoreSrv.setSelectedPaymentMethod(null);
      throw err;
    } finally {
      showLoader && this.setInnerLoader(false, false);
    }
  }

  private async _getStripeIntent(
    id: string,
    availablePaymentMethods: IPaymentMethodMapToElem[],
    showPopupAfterStripeIntent: boolean,
    showLoader: boolean = true
  ): Promise<stripe.paymentIntents.PaymentIntent> {
    const selectedPaymentMethod = availablePaymentMethods.find((elem) => elem.source.id === id);
    const stripeIntent = await this._getStripeIntentHandler(selectedPaymentMethod, showPopupAfterStripeIntent, showLoader);

    this.logInfo(selectedPaymentMethod.type, 'Create stripe intent success');

    return stripeIntent;
  }

  async getCardPaymentIntent(
    currency: CurrencyType,
    selectedPaymentMethod?: IPaymentMethodMapToElem
  ): Promise<stripe.paymentIntents.PaymentIntent> {
    try {
      const paymentIntent = await this._getDefaultStripeIntent(PAYMENT_METHOD.CARD, currency, selectedPaymentMethod);

      return paymentIntent;
    } catch (err) {
      throw new PurchaseError({
        name: 'STRIPE_INTENT_ERROR',
        message: 'Get card payment intent error',
        cause: err,
      });
    }
  }

  private async _getStripeIntentHandler(
    selectedPaymentMethod: IPaymentMethodMapToElem,
    showPopupAfterStripeIntent: boolean,
    showLoader: boolean = true
  ): Promise<stripe.paymentIntents.PaymentIntent> {
    if (selectedPaymentMethod && this.checkoutStoreSrv.finalPrice > 0) {
      const currentCountry = this.countrySrv.getCurrentCountry();
      let stripeIntent: stripe.paymentIntents.PaymentIntent;

      showLoader && this.setInnerLoader(true, true);

      if (selectedPaymentMethod.type === PAYMENT_METHOD.CARD) {
        stripeIntent = await this._getDefaultStripeIntent(PAYMENT_METHOD.CARD, currentCountry.currency, selectedPaymentMethod);
      } else if (selectedPaymentMethod.type === PAYMENT_METHOD.IDEAL) {
        stripeIntent = await this._getIDealIntent(currentCountry.currency, selectedPaymentMethod);
      } else if (selectedPaymentMethod.type === PAYMENT_METHOD.PAYPAL) {
        stripeIntent = await this._getDefaultStripeIntent(PAYMENT_METHOD.PAYPAL, currentCountry.currency, selectedPaymentMethod);
      } else {
        stripeIntent = null;
      }

      if (showPopupAfterStripeIntent) {
        this.popupSrv.open(StatusPopupComponent, {
          data: {
            msgSuccess: this.textSrv.getText('Successfuly added {paymentMethod}', {
              '{paymentMethod}': this.checkoutStoreSrv.selectedPaymentMethod.type,
            }),
          },
        });
      }

      return stripeIntent;
    }
  }

  private async _getDefaultStripeIntent(
    paymentMethod: PAYMENT_METHOD.CARD | PAYMENT_METHOD.PAYPAL,
    currency: CurrencyType,
    selectedPaymentMethod?: IPaymentMethodMapToElem
  ): Promise<stripe.paymentIntents.PaymentIntent> {
    const intentBody: any = {
      amount: this.checkoutStoreSrv.finalPrice,
      currency: currency.toLowerCase(),
      customer: this.checkoutStoreSrv.user.paymentMethods[0].id,
      methodTypes: paymentMethod,
    };

    if (selectedPaymentMethod) {
      intentBody.method = selectedPaymentMethod.source?.id || null;
      intentBody.shipping = this.checkoutPaymentCommonSrv.getStripeShippingDetails();
    }

    const paymentIntent = await this.stripeSrv.getIntent(intentBody);

    return paymentIntent;
  }

  private _getIDealIntent(
    currency: CurrencyType,
    selectedPaymentMethod: IPaymentMethodMapToElem
  ): Promise<stripe.paymentIntents.PaymentIntent> {
    return this.stripeSrv.getIntent({
      amount: this.checkoutStoreSrv.finalPrice,
      currency: currency.toLowerCase(),
      method: selectedPaymentMethod.source.ideal.sepaInfo.id,
      customer: this.checkoutStoreSrv.user.paymentMethods[0].id,
      methodTypes: 'sepa_debit',
    });
  }
}
