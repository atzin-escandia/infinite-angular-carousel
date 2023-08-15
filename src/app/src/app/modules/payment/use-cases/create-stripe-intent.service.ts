import { Injectable } from '@angular/core';
import {PAYMENT_METHOD} from '@app/interfaces';
import {CountryService} from '@app/services';
import {PaymentStripeService} from '../services';

@Injectable()
export class CreateStripeIntentUseCaseService {
  constructor(
    private countrySrv: CountryService,
    private paymentStripeSrv: PaymentStripeService,
  ) { }

  async exec(
    paymentMethod: PAYMENT_METHOD.CARD | PAYMENT_METHOD.PAYPAL,
    amount: number,
    customerId: string,
    selectedPaymentId?: string
  ): Promise<stripe.paymentIntents.PaymentIntent> {
    const currentCountry = this.countrySrv.getCurrentCountry();
    const stripeIntent = await this.paymentStripeSrv.getIntent(
      amount,
      customerId,
      paymentMethod,
      currentCountry.currency,
      selectedPaymentId
    );

    return stripeIntent;
  }
}
