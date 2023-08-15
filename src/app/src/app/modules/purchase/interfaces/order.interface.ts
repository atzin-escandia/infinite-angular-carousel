import { IAddress } from '../../../interfaces';
import { PAYMENT_METHOD } from '../constants/payment-method.constants';

export interface IOrder {
  extra?: IOrderExtra;
  cart: any;
  address: IAddress;
  paymentMethod: any;
  shipperMessage?: string;
  dedicatoryMsg?: string;
  price: number;
  allowCredits?: boolean;
}

export interface IOrderExtra {
  buttonId?: string;
  tabId?: string;
}

export interface IApplePayPaymentMethod {
  card: stripe.paymentMethod.PaymentMethodCard;
  intent: stripe.paymentIntents.PaymentIntent;
  type: PAYMENT_METHOD.CARD;
}
