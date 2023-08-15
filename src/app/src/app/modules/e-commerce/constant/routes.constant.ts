export const publicPath = '/';

const MULTI_LANG_ROUTES = {
  es: 'tienda',
  en: 'shop',
  de: 'shop',
  fr: 'boutique',
  nl: 'shop',
  it: 'negozio',
  sv: 'butik'
};

const ROUTES = {
  UNAVAILABLE: 'unavailable',
  ERROR: 'error',
  MULTI_LANG_ROUTES
};

const COMPLETE_ROUTES = {
  COMPLETE_UNAVAILABLE: `${publicPath}${ROUTES.UNAVAILABLE}`,
};

export const E_COMMERCE_ROUTES = { ...ROUTES, ...COMPLETE_ROUTES };
