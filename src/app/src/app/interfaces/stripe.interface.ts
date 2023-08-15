export enum PAYMENT_METHOD {
  CARD = 'card',
  IDEAL = 'ideal',
  SEPA = 'sepa',
  PAYPAL = 'paypal',
  CREDITS = 'credits',
  APPLE_PAY = 'applePay',
  KLARNA = 'klarna',
}

export interface IStripeRef {
  card: stripe.elements.Element;
  ideal?: stripe.elements.Element;
  sepa?: stripe.elements.Element;
  stripe: stripe.Stripe;
  stripeSecret: string;
  name: string;
  type: PAYMENT_METHOD;
}

export interface IStripeErrorsApiRes {
  stripe: {
    errors: IStripeErrors;
  };
}

export interface IStripeErrors {
  codes: {
    [key: string]: number;
  };
  publicMessages: {
    [key: string]: string;
  };
}
