import { Injectable } from '@angular/core';
import { INewCardData } from '@app/interfaces';
import { environment } from '../../../../environments/environment';
import { PaymentStripeService } from '../services';

@Injectable()
export class ConfirmStripeCardIntentUseCaseService {
  constructor(private paymentStripeSrv: PaymentStripeService) { }

  async exec(
    stripeIntent: stripe.paymentIntents.PaymentIntent,
    selectedPaymentId: string,
    name: string,
    newCardData?: INewCardData
  ): Promise<stripe.paymentIntents.PaymentIntent> {
    const {stripe, stripeIntentStatuses} = this.paymentStripeSrv;

    let confirmCardPaymentData: stripe.ConfirmCardPaymentData;

    if (newCardData) {
      confirmCardPaymentData = this.paymentStripeSrv.getConfirmNewCardPaymentData(newCardData);
    } else {
      if ([stripeIntentStatuses.reqConfirmation, stripeIntentStatuses.reqAction].includes(stripeIntent.status)) {
        confirmCardPaymentData = {
          setup_future_usage: environment.stripe.usage,
        };
      } else if (stripeIntent.status === stripeIntentStatuses.reqPaymentMethod) {
        confirmCardPaymentData = {
          setup_future_usage: environment.stripe.usage,
          payment_method: {
            card: selectedPaymentId as any,
            billing_details: {
              name,
            },
          },
        };
      } else {
        throw new Error(`Invalid payment intent status for intent ${stripeIntent.id}`);
      }
    }

    const confirmCardPaymentRes: stripe.PaymentIntentResponse = await stripe.confirmCardPayment(
      stripeIntent.client_secret,
      confirmCardPaymentData
    );

    if (confirmCardPaymentRes.paymentIntent) {
      return confirmCardPaymentRes.paymentIntent;
    } else if (confirmCardPaymentRes.error) {
      throw confirmCardPaymentRes.error;
    } else {
      throw new Error('No payment intent response');
    }
  }
}
