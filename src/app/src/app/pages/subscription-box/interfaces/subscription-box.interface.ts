import { IAddress } from '../../../interfaces/address.interface';

export interface SubscriptionStripePlanJson {
  code: number;
  data: SubscriptionStripePlan[];
}

export interface SubscriptionStripePlan {
  id: string;
  slug: string;
  intervalInMonths: number;
  priceAmount: number;
}

export interface SubscriptionPlanJson {
  code: number;
  data: SubscriptionBoxJson[];
}

export interface SubscriptionPlan {
  boxes: SubscriptionBox[];
  price: number;
  planId: string;
  nextBox: number;
}

export interface SubscriptionBoxJson {
  year: number;
  month: number;
  processAt: Date;
  billingAt: Date;
  sendAt: Date;
  deliveryAt: Date;
  image: string;
  masterBox: {
    image: string;
    _m_title: BoxTitleTranslations;
  };
}

export interface SubscriptionBox {
  year: number;
  monthText: string;
  monthNumber: number;
  processDate: Date;
  billingDate: Date;
  sendDate: Date;
  deliveryDate: Date;
  image: string;
  multiLangTitle: BoxTitleTranslations;
}

export interface BoxTitleTranslations {
  es: string;
  en: string;
  de: string;
  fr: string;
  nl: string;
  it: string;
  sv: string;
}

export interface BoxSubscription {
  planId: string;
  paymentMethodId: string;
  shipmentAddress: IAddress;
}

export interface UserSubscriptionJson {
  code: number;
  data: UserSubscription[];
}

export interface UserSubscription {
  id: string;
  status: string;
  startsAt: Date;
  endsAt: Date;
  countryCode: string;
  plan: {
    id: string;
    slug: string;
    intervalInMonths: number;
    priceAmount: number;
  };
}

export interface UserActiveSubscription {
  subscriptionId: string;
  planId: string;
  price: number;
  deliveryDate: Date;
  processDate: Date;
  billingDate: Date;
}

export interface DiscoveryBoxFirebaseParams {
  isDiscoveryBoxMenuActive: boolean;
  isDiscoveryBoxUserAreaActive: boolean;
}
