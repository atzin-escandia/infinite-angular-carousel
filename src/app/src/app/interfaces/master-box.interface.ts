import {IMultilingual} from './multilingual.interface';

export interface CurrencyRate {
  currency: string;
  symbol: string;
  rate: number;
}

export interface Currency {
  farmer: CurrencyRate;
  crowdfarmer: CurrencyRate;
}

export interface Price {
  amount: number;
  net: number;
  vat: number;
  shipping: number;
  shippingPerBox: number;
  currency: Currency;
}

export interface DeliveryDates {
  first: Date;
  days: number;
  from: number;
  to: number;
}

export interface ProductMb {
  _productId: string;
  quantity: number;
}

export interface MasterBox {
  id: string;
  active: boolean;
  adoptionActive: boolean;
  ohActive: boolean;
  name: string;
  publicName: string;
  weightUnit: string;
  weight: number;
  pickingDays: number;
  products: ProductMb[];
  price?: Price;
  ohPrice?: Price;
  adoptionDates?: DeliveryDates;
  ohDates?: DeliveryDates;
  _id: string;
  _m_name: IMultilingual;
  _m_publicName: IMultilingual;
  _m_weightUnit: IMultilingual;
}

export type MasterBoxType = 'OVERHARVEST' | 'ADOPTION';
