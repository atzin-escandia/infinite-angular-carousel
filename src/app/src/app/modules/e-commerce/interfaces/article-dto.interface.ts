import { HeaderSeal, ProjectSeals, SealsCategory } from '@app/interfaces';

export interface ArticleDTO {
  imgUrl?: string;
  id?: string;
  _id?: string;
  _m_title?: DescPerLangsDTO;
  _m_nameDetail?: DescPerLangsDTO;
  _m_detailTitle?: DescPerLangsDTO;
  _m_subtitle?: DescPerLangsDTO;
  weightInKilos?: number;
  seals?: ProjectSeals[] | SealsCategory;
  pricePerUnit?: number;
  totalPrice?: number;
  currency?: string;
  minQuantity?: number | number[];
  quantity?: number;
  _m_units?: DescPerLangsDTO;
  dates?: string[];
  deliveryDates?: string[];
  status?: number; // 1 Available, 2 Unavailable
  isUnavailable?: boolean;
  subvarieties?: SubVarietiesDTO[];
  farmer?: FarmerDTO;
  detailSeals?: ProjectSeals[];
  additionalInfo?: DescPerLangsDTO;
  articleId?: string;
  headerSeals?: HeaderSeal[];
  isNotSharedDate?: boolean;
}

export interface SubVarietiesDTO {
  _m_description: DescPerLangsDTO;
  _m_name: DescPerLangsDTO;
}

export interface FarmerDTO {
  name: string;
  farmName?: string;
  extraInfo?: FarmerTypeDTO[];
  mapURL?: string;
  pictureUrl?: string;
  _m_slogan?: DescPerLangsDTO;
  country?: string;
}

export interface FarmerTypeDTO {
  type?: string;
  lokaliseId?: string;
  _m_value?: DescPerLangsDTO;
  icon?: string;
}

export interface DescPerLangsDTO {
  en?: string;
  de?: string;
  es?: string;
  fr?: string;
  it?: string;
  sv?: string;
  nl?: string;
}

interface File {
  name?: string;
  url?: string;
}

export interface ArticleIdQuantity {
  id: string;
  quantity: number;
}
