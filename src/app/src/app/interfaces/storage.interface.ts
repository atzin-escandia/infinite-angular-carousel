import { IAddress } from './address.interface';
import { UnknownObjectType } from './common.interface';
import { IAllowedPaymentMethods } from './payment-method.interface';
import { SubscriptionBox } from '../pages/subscription-box/interfaces/subscription-box.interface';

export interface IStorageLastPayment {
  products: UnknownObjectType[];
  cart: UnknownObjectType[];
  address?: IAddress;
  price: number;
  paymentIntentId?: string;
  stripeId?: string;
  purchase?: IStorageLastPaymentPurchase;
  usedCredits?: number;
  currency?: string;
  payment_method_types?: IAllowedPaymentMethods[];
  payment_method?: string;
  discoveryBox?: SubscriptionBox;
}

export interface IStorageLastPaymentPurchase {
  orders: UnknownObjectType[];
  payment: any;
}
