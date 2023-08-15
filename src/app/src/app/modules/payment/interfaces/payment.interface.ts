import { IPaymentMethodMapToElem, PAYMENT_METHOD, UnknownObjectType } from '@app/interfaces';

export interface IPaymentMethodAddEv {
  type: PAYMENT_METHOD;
  methodId: string;
  setAsFavorite?: boolean;
}

export interface ISelectedPaymentMethod {
  type: PAYMENT_METHOD;
  source: UnknownObjectType;
}

export interface IPaymentMethod {
  card: stripe.paymentMethod.PaymentMethodCard;
  intent: stripe.paymentIntents.PaymentIntent;
  type: PAYMENT_METHOD.CARD;
}

export interface IPayPalSetupData {
  payment_method: string;
  return_url: string;
  mandate_data: {
    customer_acceptance: {
      type: string;
      online: {
        infer_from_client: boolean;
      };
    };
  };
}
