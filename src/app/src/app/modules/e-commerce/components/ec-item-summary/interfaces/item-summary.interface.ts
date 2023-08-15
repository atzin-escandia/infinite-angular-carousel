import { DescPerLangsDTO } from '@app/modules/e-commerce/interfaces';

export interface ItemSummaryDTO {
  id: string | number;
  _m_title: DescPerLangsDTO;
  _m_subtitle: DescPerLangsDTO;
  _m_units: DescPerLangsDTO;
  quantity: number;
  pricePerUnit: number;
  currency?: string;
  images?: string[];
  isUnavailable?: boolean;
  info?: string;
  dates?: string[];
}
