import { IMultilingual } from '../../../../interfaces/multilingual.interface';

export interface IFarmerOh {
  altSeo: any;
  assigneeFH: string;
  assigneeLOG: string;
  bioPictureURL: string;
  biography: string;
  blockSlug: boolean;
  company: any;
  coverURL: string;
  email: string;
  erpSync: boolean;
  extraInfo: any[];
  farms: any[];
  historyFarmerPicture: string;
  inCfSince: string;
  languages: string[];
  medals: any[];
  name: string;
  videoURL?: IMultilingual;
  notificationLanguage: string;
  paymentMethods: {avoid: false; bankId: string; id: string; tos: boolean; type: string}[];
  phone: {prefix: string; number: string};
  pictureURL: string;
  position: string;
  salesforce: {id: string};
  seals: {files: any[]; _seal: string}[];
  slogan: string;
  slug: string;
  surnames: string;
  typeVatGroup: string;
  _id: string;
  _m_biography: string;
  _m_position: string;
  _m_slogan: string;
}
