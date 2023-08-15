import { Injectable } from '@angular/core';
import { StripeService } from '@app/services';
import { first, firstValueFrom, map } from 'rxjs';
import { StripeResource } from '@app/resources';
import { INewCardData, IStripeErrors, PAYMENT_METHOD } from '@app/interfaces';
import { CurrencyType } from '@app/constants/app.constants';
import {IPayPalSetupData} from '../../interfaces/payment.interface';

@Injectable()
export class PaymentStripeService {
  readonly stripeIntentStatuses = {
    reqConfirmation: 'requires_confirmation',
    reqAction: 'requires_action',
    reqPaymentMethod: 'requires_payment_method',
    reqCapture: 'requires_capture',
    succeeded: 'succeeded',
  };

  private _stripe: stripe.Stripe;
  private _stripeErrors: IStripeErrors;

  get stripe(): stripe.Stripe & { confirmPayPalSetup(clientSecret: string, setupData: IPayPalSetupData): Promise<void> } {
    return this._stripe as stripe.Stripe & { confirmPayPalSetup(clientSecret: string, setupData: IPayPalSetupData): Promise<void> };
  }

  constructor(
    private stripeSrv: StripeService,
    private stripeRsc: StripeResource,
  ) { }

  async init(): Promise<stripe.Stripe> {
    try {
      await this.setStripe();
      await this.setErrors();

      return this._stripe;
    } catch (err) {
      // TODO: catch error
      console.log(err);
    }
  }

  getPublicErrorMessage(error?: stripe.Error): string {
    const { codes, publicMessages } = this._stripeErrors;

    if (error) {
      const code = error.decline_code || error.code || error.type;

      if (code) {
        const num = codes[code] ?? 'default';

        return num === 0 ? error.message : publicMessages[num];
      }
    }

    return publicMessages?.default;
  }

  async getIntent(
    amount: number,
    customerId: string,
    paymentMethod: PAYMENT_METHOD.CARD | PAYMENT_METHOD.PAYPAL,
    currency: CurrencyType,
    selectedPaymentMethodId?: string
  ): Promise<stripe.paymentIntents.PaymentIntent> {
    const intentBody: any = {
      amount,
      currency: currency.toLowerCase(),
      customer: customerId,
      methodTypes: paymentMethod,
      ...(selectedPaymentMethodId && { method: selectedPaymentMethodId })
    };

    const paymentIntent = await this.stripeSrv.getIntent(intentBody);

    return paymentIntent;
  }

  async savePaypalAndGetIntent(amount: number, currency: CurrencyType, customerId: string): Promise<stripe.paymentIntents.PaymentIntent> {
    const currentPaymentId = await this.createPaymentMethod();

    const intent: stripe.paymentIntents.PaymentIntent = await this.stripeSrv.getIntent({
      amount,
      currency: currency.toLowerCase(),
      customer: customerId,
      methodTypes: PAYMENT_METHOD.PAYPAL,
      method: currentPaymentId,
      savePaymentMethod: true
    });

    return intent;
  }

  getConfirmNewCardPaymentData({ card, name }: INewCardData): stripe.ConfirmCardPaymentData {
    return {
      setup_future_usage: 'off_session', // TODO: This could be variable
      payment_method: {
        card,
        billing_details: {
          name,
        },
      },
    };
  }

  getPayPalSetupData(paymentMethodId: string, returnUrl: string): IPayPalSetupData {
    return {
      payment_method: paymentMethodId,
      return_url: returnUrl,
      mandate_data: {
        customer_acceptance: {
          type: 'online',
          online: {
            infer_from_client: true,
          },
        },
      },
    };
  }

  private async createPaymentMethod(): Promise<any> {
    const paymentMethod = await this.stripeSrv.createPaymentMethod({
      card: {},
      type: PAYMENT_METHOD.PAYPAL,
    });

    return paymentMethod;
  }

  private async setStripe(): Promise<void> {
    if (this.stripeSrv.get()) {
      this._stripe = this.stripeSrv.get() as stripe.Stripe;
    } else {
      this.stripeSrv.init();

      const stripe = await firstValueFrom(this.stripeSrv.loadedStripeSub.pipe(
        first((val) => !!val),
        map(() => this.stripeSrv.get() as stripe.Stripe),
      ));

      this._stripe = stripe;
    }
  }

  private async setErrors(): Promise<void> {
    const res = await this.stripeRsc.getStripeErrors();

    this._stripeErrors = res.stripe.errors;
  }
}
