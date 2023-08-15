import {IUserPaymentMethod} from '../interfaces/payment-method.interface';

export interface UserInterface {
  active: boolean;
  addresses?: [
    {
      city: string;
      country: string;
      details: string;
      favourite: boolean;
      gift: boolean;
      name: string;
      number: string;
      phone: {
        prefix: string;
        number: string;
      };
      province: string;
      street: string;
      surnames: string;
      zip: string;
    }
  ];
  createdAt?: string;
  email: string;
  newsletterCats: [string];
  name: string;
  newsletterPermissionGiven: boolean;
  notificationLanguage: string;
  paymentMethods?: IUserPaymentMethod[];
  phone: {
    prefix: string;
    number: string;
  };
  registrationInfo: {
    url?: string;
    ipCountry?: string;
  };
  surnames: string;
  updatedAt?: string;
  _id: string;
  _user: string;
  favourites?: {
    oh: [];
    adoption: [];
  };
}
