import { PAYMENT_METHOD } from '../modules/purchase/constants/payment-method.constants';
import { IAddress } from './address.interface';
import { UnknownObjectType } from './common.interface';

export enum PurchaseCartType {
  GROUP = 'GROUP',
  INDIVIDUAL = 'INDIVIDUAL',
}

export enum PurchaseCartStatus {
  BLOCKED = 'BLOCKED',
  ACTIVE = 'ACTIVE',
}

export enum PurchaseInfoStatus {
  INITIATED = 'INITIATED',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface IPurchaseCart {
  id?: string;
  crowdfarmerId?: string;
  address?: IAddress;
  type: PurchaseCartType;
  items: IPurchaseCartItem[];
  country?: string;
  status?: PurchaseCartStatus;
  total?: IPurchaseCartTotal;
  lastPayDay?: string;
  promoterAssumesPayment: boolean;
  guestsLimit: number;
}

export interface IPurchaseCartItem {
  numMasterBoxes: number;
  type: string;
  uberUp: null;
  masterBox: string;
  up: string;
  selectedDate: string;
  price?: IPurchaseCartItemPrice;
}

export interface IPurchaseCartTotal {
  amount: number;
  groupOrderAmount: IPurchaseCartAmount;
}

export interface IPurchaseCartCreateTo {
  items: IPurchaseCartItem[];
  country: string;
}

export interface IPurchaseCartItemPrice {
  amount: number;
  net: number;
  vat: number;
  shipping: number;
  shippingPerBox: number;
  currency: IPurchaseCartCurrency;
  groupOrderAmount?: IPurchaseCartAmount;
}

export interface IPurchaseCartAmount {
  promoter: number;
  guests: number;
}

export interface IPurchaseCartCurrency {
  farmer: IPurchaseCartFarmer;
  crowdfarmer: IPurchaseCartFarmer;
}

export interface IPurchaseCartFarmer {
  currency: string;
  symbol: string;
  rate: number;
}

export interface IPurchaseCartGroupInfo {
  promoterAssumesPayment: boolean;
  guestsLimit: number;
}

export interface IPurchaseCartTo {
  cartId: string;
  paymentMethod: IPurchaseCartToPaymentMethod;
}

export interface IPurchaseCartToAsGuest {
  paymentMethod: IPurchaseCartToPaymentMethod & { customer: string };
}
export interface IPurchaseCartToPaymentMethod {
  id: string;
  type: PAYMENT_METHOD;
}

export interface IPurchaseCartFrom {
  hash: string;
  id: string;
  paymentIntent: stripe.paymentIntents.PaymentIntent;
}

export interface IPurchaseInfo {
  id?: string;
  hash: string;
  purchaseNumber: string;
  cartId: string;
  cart?: IPurchaseCart;
  crowdfarmerId?: string;
  crowdfarmer?: IPurchaseInfoCrowdfarmer;
  type: PurchaseCartType;
  country: string;
  status: PurchaseInfoStatus;
  totalToPay: IPurchaseInfoTotalToPay;
  promoterAssumesPayment: boolean;
  guestsLimit: number;
  lastPayDay?: Date;
  orders?: string[];
  updates?: IPurchaseInfoUpdate[];
  currentPaid: number;
  invites?: IPurchaseInfoInvitation[];
  guests?: string[];
  paymentIntent?: UnknownObjectType;
}

export interface IPurchaseInfoCrowdfarmer {
  name: string;
  surnames: string;
}

export interface IPurchaseInfoUpdate {
  status: PurchaseInfoStatus;
  timestamp: string;
}

export interface IPurchaseInfoTotalToPay {
  amount: number;
  groupOrderAmount?: IPurchaseInfoTotalToPayGroupOrderAmount;
}

export interface IPurchaseInfoTotalToPayGroupOrderAmount {
  promoter: number;
  guests: number;
}

export interface IPurchaseInfoInvitation {
  message: string;
  to: string[];
}

export interface IGroupOrderConfirm {
  purchaseId: string;
  crowdfarmerId: string;
  cart: IPurchaseCart;
}
