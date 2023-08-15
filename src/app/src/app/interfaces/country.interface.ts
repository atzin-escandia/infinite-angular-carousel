import {CurrencyType} from '../constants/app.constants';
import {IMultilingual} from './multilingual.interface';

export interface ICountry {
  currency: CurrencyType;
  deliver?: boolean;
  forbiddenZips?: string[];
  iso?: string;
  locale: string;
  name?: string;
  onboarding?: boolean;
  paypalAllowed?: boolean;
  prefix?: string;
  sepaAllowed?: boolean;
  zipMasks?: string[];
  _id?: string;
  _m_name?: IMultilingual;
  _m_order?: IMultilingual;
}

export interface ICountryIso {
  [iso: string]: ICountry;
}
