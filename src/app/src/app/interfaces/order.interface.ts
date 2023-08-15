import { PAYMENT_METHOD } from './stripe.interface';

export interface IOrderPayment {
  type: PAYMENT_METHOD;
  intent: stripe.paymentIntents.PaymentIntent;
  card?: stripe.Card | string;
  payPalCallbackUrl?: string;
}
