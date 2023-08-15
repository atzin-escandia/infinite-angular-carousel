import { RestrictionDTO } from '@app/modules/e-commerce/interfaces';

export const MIN_UNITS_LIMIT = 3;
export const MIN_PRICE_LIMIT = 20;

export const DEFAULT_RESTRICTIONS: RestrictionDTO = {
  minimumArticles: MIN_UNITS_LIMIT,
  minimumPVP: MIN_PRICE_LIMIT
};
