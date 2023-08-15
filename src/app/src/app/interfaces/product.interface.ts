import { PRODUCT_TYPE } from '@app/constants/product.constants';
import { IMultilingual } from './multilingual.interface';

export interface Product {
  active: boolean;
  originCountryVat?: number;
  over18: boolean;
  parcelWeight: number;
  price: number;
  reflexDesignation?: string;
  reflexShortDesignation?: string;
  subcategory: string;
  umUnit: string;
  weight: number;
  _farmer: string;
  _id: string;
  _m_characteristics?: IMultilingual;
  _m_description?: IMultilingual;
  _m_name: IMultilingual;
}

export interface IECProduct {
  type: PRODUCT_TYPE.ECOMMERCE;
  available: boolean;
  errors?: IECProductErrors;
  ecommerceProducts: IECProductItem[];
  availableDates: string[];
  price: number;
  cantSend: boolean;
  datesNoAvailable: boolean;
}

export interface IECProductErrors {
  availability: IECProductAvailabilityError[];
  restrictions: IECProductRestrictionError[];
}

export interface IECProductAvailabilityError {
  type: 'noStock' | 'availableDates' | 'sendDate';
  articles: string[];
}

export interface IECProductRestrictionError {
  type: 'difference' | 'articlesLeft';
  value: number;
}

export interface IECProductItem {
  farm: { _m_name: { [key: string]: string } };
  farmer: { name: string; pictureURL: string; surnames: string };
  id: string;
  _m_name: { [key: string]: string };
  _season: string;
  pictureURL: string;
  dates: string[];
  pricePerUnit: number;
  weight: number;
  unitOfMeasure: { [key: string]: string };
  available: boolean;
  quantity: number;
  seals: {
    up: { _seal: string; files: { name: string; url: string }[] }[];
    farmer: { _seal: string; files: { name: string; url: string }[] }[];
  };
}
