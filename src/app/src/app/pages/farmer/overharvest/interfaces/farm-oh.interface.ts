import { UnknownObjectType } from '@app/interfaces';
import { IExtraInfoOh } from './extra-info-oh.interface';

export interface IFarmOh {
  address: {street: string; number: string; details: string; city: string; zip: string; country?: string};
  altSeo: any;
  area: string;
  description: string;
  extraInfo: IExtraInfoOh[];
  farmingType: string;
  historyFarmPicture: string;
  mapURL: string;
  name: string;
  pictureURL: string;
  plot: string;
  products: any[];
  salesforce: {id: string};
  seals: any[];
  zone: string;
  _id: string;
  _m_description: string;
  _m_name: UnknownObjectType;
}
