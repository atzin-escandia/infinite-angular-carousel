import { CurrencyType } from '../constants/app.constants';
import {UnknownObjectType} from './common.interface';
import { PAYMENT_METHOD } from './stripe.interface';

export type AllowedPaymentMethodName = 'SEPA' | 'card' | 'PayPal' | 'Ideal';

export interface IPaymentMethods {
  cards?: IUserPaymentMethodCard[];
  ideals?: IUserPaymentMethodIdeal[];
  paypals?: IUserPaymentMethodPaypal[];
  sepas?: IUserPaymentMethodSepa[];
}

export interface IUserPaymentMethod extends IPaymentMethods {
  type: string;
  id: string;
}

export interface IUserPaymentMethodBase {
  favourite: boolean;
  banned: boolean;
}

export interface IUserPaymentMethodCard extends IUserPaymentMethodBase {
  cardInfo: any;
}

export interface IUserPaymentMethodIdeal extends IUserPaymentMethodBase {
  idealInfo: any;
}

export interface IUserPaymentMethodPaypal extends IUserPaymentMethodBase {
  paypalInfo: any;
}

export interface IUserPaymentMethodSepa extends IUserPaymentMethodBase {
  sepaInfo: any;
}

export interface IPaymentMethodMapToElem {
  banned?: boolean;
  favourite?: boolean;
  source: any;
  type: PAYMENT_METHOD;
}

export interface IAllowedPaymentMethods {
  card: boolean;
  ideal: boolean;
  sepa: boolean;
  paypal: boolean;
  applePay?: boolean;
  klarna?: boolean;
}

export interface PaymentMethodsActionResInterface {
  result: string;
  paymentMethods: StripePaymentMethodsInterface;
}

export interface StripePaymentMethodsInterface {
  type: 'stripe';
  id: string;
  cards: IUserPaymentMethodCard[];
  ideals: IUserPaymentMethodIdeal[];
  paypals: IUserPaymentMethodPaypal[];
  sepas: IUserPaymentMethodSepa[];
}

export interface AllowedPaymentMethodInterface {
  name: AllowedPaymentMethodName;
  allowedCountries: string[];
}

export interface IStripeCallbackRedirectParams {
  is_group_order?: string;
  go_purchase_id?: string;
  go_hash?: string;
  payment_intent_client_secret?: string;
  selected_payment_method_id?: string;
  button_id?: string;
}

export interface INewCard {
  currency: CurrencyType;
  data: INewCardData;
}

export interface INewCardData {
  name: string;
  card: stripe.elements.Element;
}
