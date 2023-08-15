import { IPhone } from './phone.interface';

export interface AddressInterface {
  city: string;
  country: string;
  details: string;
  gift: boolean;
  name: string;
  // eslint-disable-next-line id-blacklist
  number: string;
  phone: IPhone;
  province: string;
  street: string;
  surnames: string;
  zip: string;
  favourite?: boolean;
  addressId?: string;
  id?: string;
  edited?: boolean;
}

export type AddressType = {
  city: string;
  country: string;
  details: string;
  test: any;
  gift: boolean;
  name: string;
  // eslint-disable-next-line id-blacklist
  number: string;
  phone: {
    prefix: string;
    // eslint-disable-next-line id-blacklist
    number: string;
  };
  province: string;
  street: string;
  surnames: string;
  zip: string;
  favourite?: boolean;
  addressId?: string;
  id?: string;
  edited?: boolean;
};

export interface FarmerItem {
  iconClass?: string;
  lokaliseKey?: string;
}
