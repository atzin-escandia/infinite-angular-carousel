import { Injectable } from '@angular/core';
import { PaymentCommonService, PaymentStripeService } from '../services';
import { PAYMENT_METHOD, UnknownObjectType } from '@app/interfaces';
import { CountryService, StripeService } from '@app/services';
import { CreatePaymentMethodUseCaseService } from './create-payment-method.service';

@Injectable()
export class PaypalPaymentUseCaseService extends PaymentCommonService {

  constructor(
    private stripeSrv: StripeService,
    private countrySrv: CountryService,
    private paymentStripeSrv: PaymentStripeService,
    private createPaymentMethodUseCaseSrv: CreatePaymentMethodUseCaseService,
  ) {
    super();
  }

  async exec(
    cart: UnknownObjectType[],
    currentIso: string,
    amount: number,
    customerId: string,
    paymentMethodId?: string,
    purchaseDataExtra?: UnknownObjectType
  ): Promise<{ intent: stripe.paymentIntents.PaymentIntent; url: string }> {
    await this.getCartAndValidate(cart, currentIso);

    if (!paymentMethodId) {
      paymentMethodId = await this.createPaymentMethodUseCaseSrv.exec({
        type: PAYMENT_METHOD.PAYPAL
      });
    }

    if (paymentMethodId) {
      const intent = await this.createStripeIntent(amount, customerId, paymentMethodId);
      const { stripeIntentStatuses } = this.paymentStripeSrv;
      const isValidIntentStatus = [stripeIntentStatuses.reqConfirmation, stripeIntentStatuses.reqAction].includes(intent.status);

      if (isValidIntentStatus) {
        const url = await this.confirmStripeIntent(
          intent.id,
          cart,
          amount,
          purchaseDataExtra
        );

        if (url) {
          return { intent, url };
        } else {
          throw new Error('No PayPal redirect url');
        }
      } else {
        throw new Error('Invalid PayPal payment intent status');
      }
    } else {
      throw new Error('No PayPal payment method id');
    }
  }

  private async createStripeIntent(
    amount: number,
    customerId: string,
    paymentMethodId: string
  ): Promise<stripe.paymentIntents.PaymentIntent> {
    const currentCountry = this.countrySrv.getCurrentCountry();

    const intent: stripe.paymentIntents.PaymentIntent = await this.stripeSrv.getIntent({
      amount,
      currency: currentCountry?.currency?.toLowerCase(),
      method: paymentMethodId,
      customer: customerId,
      savePaymentMethod: true,
      methodTypes: PAYMENT_METHOD.PAYPAL,
    });

    return intent;
  }

  private async confirmStripeIntent(
    stripeIntentId: string,
    cart: UnknownObjectType[],
    price: number,
    purchaseDataExtra: UnknownObjectType = {}
  ): Promise<string> {
    const path = window.location.href;

    const { url } = await this.stripeSrv.confirmPaymentMethod({
      id: stripeIntentId,
      mandate_type: 'offline',
      url: `${path}&payment_type=${PAYMENT_METHOD.PAYPAL}`,
      purchaseData: { cart, price, ...purchaseDataExtra },
    }, 'paypal');

    return url;
  }
}
