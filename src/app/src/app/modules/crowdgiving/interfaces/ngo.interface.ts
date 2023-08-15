import { KeyValue } from '@angular/common';

type LangKey =  'es' | 'en' | 'fr' | 'de' | 'sv' | 'it' | 'nl';

export interface INGO {
  _id: string;
  name: string;
  logo: string;
  information: INGOInformation;
  address: INGOAddress;
  slug: string;
}

export interface INGOAddress {
  city: string;
  country: string;
}

export interface INGOInformation {
  _m_shortDescription: KeyValue<LangKey, string>;
  images: string[];
}
