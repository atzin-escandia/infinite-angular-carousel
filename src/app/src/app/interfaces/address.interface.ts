import { IPhone } from './phone.interface';

export interface IAddress {
  name: string;
  surnames: string;
  phone: IPhone;
  street: string;
  number: string;
  details: string;
  city: string;
  zip: string;
  province: string;
  country: string;
  id?: string | number;
  gift?: boolean | string;
  favourite?: boolean;
  addressId?: string;
  edited?: boolean;
}
