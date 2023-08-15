export interface PromotionInterface {
  active: boolean;
  farmLocation: string;
  farmName: {
    es: string;
    en: string;
    de: string;
    fr: string;
  };
  brandName: string;
  farmerName: string;
  farmerSlug: string;
  order: number;
  pictureURL: string;
  profileURL: string;
  _m_title: {
    es: string;
    en: string;
    de: string;
    fr: string;
  };
  _m_upSlug: {
    es: string;
    en: string;
    de: string;
    fr: string;
  };
}

export type PromotionsInterface = [PromotionInterface];
