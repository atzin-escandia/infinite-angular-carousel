import { Injectable } from '@angular/core';
import { PAYMENT_METHOD } from '@app/interfaces';
import { PaymentStripeService } from '../services';
import { StripeService, UserService } from '@app/services';

interface ICreatePaymentMethodParams {
  type: PAYMENT_METHOD.CARD | PAYMENT_METHOD.PAYPAL;
  cardElement?: stripe.elements.Element;
  billingDetails?: stripe.BillingDetails;
  currentIso?: string;
  payPalReturnUrl?: string;
}

@Injectable()
export class CreatePaymentMethodUseCaseService {
  constructor(
    private stripeSrv: StripeService,
    private userSrv: UserService,
    private paymentStripeSrv: PaymentStripeService,
  ) { }

  async exec(params: ICreatePaymentMethodParams = {} as any): Promise<string> {
    const { type, cardElement, billingDetails, currentIso, payPalReturnUrl } = params;

    if (type === PAYMENT_METHOD.CARD) {
      const { client_secret } = await this.stripeSrv.getSecret();

      const { setupIntent, error } = await this.paymentStripeSrv.stripe.confirmCardSetup(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails
        },
      });

      if (error) {
        throw error;
      }

      await this.userSrv.addCreditCard(setupIntent.payment_method, currentIso);

      return setupIntent.payment_method;
    } else if (type === PAYMENT_METHOD.PAYPAL) {
      const stripeSecret = await this.stripeSrv.getSecret('paypal');

      const { id } = await this.stripeSrv.createPaymentMethod({
        card: {},
        type: PAYMENT_METHOD.PAYPAL,
      });

      await this.paymentStripeSrv.stripe.confirmPayPalSetup(
        stripeSecret.client_secret,
        this.paymentStripeSrv.getPayPalSetupData(id, payPalReturnUrl)
      );
    }
  }
}
