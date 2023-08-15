import {AddressInterface} from './farmer.interface';
import {IMultilingual} from './multilingual.interface';

export enum ISubscriptionFrequency {
  WEEK = 'WEEK',
  DAY = 'DAY',
}

export interface ISubscriptionConfiguration {
  date: string;
  frequency: ISubscriptionFrequency;
  units: number;
}

export interface ISubscriptionOption {
  frequency: ISubscriptionFrequency;
  units: number;
  dates: string[];
}

export interface ISubscriptionAvailability {
  active: boolean;
  options: ISubscriptionOption[];
}

export interface ISubscriptionOrderCard {
  _id: string;
  status: string;
  subscriptionNumber: string;
  pictureURL: string;
  createdAt: string;
  subscriptionOptions: {
    frequency: ISubscriptionFrequency;
    units: number;
  };
  _m_publicName: IMultilingual;
}

export interface  ISubscriptionOrderDetail {
  status: string;
  createdAt: string;
  nextDeliveryDate: string;
  farmCountry: string;
  farmerName: string;
  pictureURL: string;
  weight: number;
  shippingEndDate: string;
  _id: string;
  orders: Record<any, any>;
  shipment: AddressInterface;
  subscriptionNumber: string;
  subscriptionOptions: {
    frequency: ISubscriptionFrequency;
    units: number;
  };
  _m_name: IMultilingual;
  _m_farmName: IMultilingual;
  _m_weightUnit: IMultilingual;
}
