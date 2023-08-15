import { Events } from '@enums/events.interface';

export const PROJECTS = {
  es: 'mercado-de-productores',
  en: 'farmers-market',
  de: 'bauernmarkt',
  fr: 'marche-producteurs',
  nl: 'boerenmarkt',
  it: 'mercato-degli-agricoltori',
  sv: 'bondemarknaden',
};

export const ADOPTIONS = {
  es: 'adopta-un-arbol',
  en: 'adopt-a-tree',
  de: 'adoptiere-einen-baum',
  fr: 'adopter-un-arbre',
  nl: 'adopteer-een-boom',
  it: 'adotta-un-albero',
  sv: 'adoptera-ett-trad',
};

export const BOXES = {
  es: 'frutas-de-temporada',
  en: 'seasonal-organic-boxes',
  de: 'saisonales-obst',
  fr: 'fruits-de-saison',
  nl: 'seizoensfruit',
  it: 'frutta-di-stagione',
  sv: 'sasongsfrukt',
};

export const SUBSCRIPTION_BOX = {
  es: 'subscription-box',
  en: 'subscription-box',
  de: 'subscription-box',
  fr: 'subscription-box',
  nl: 'subscription-box',
  it: 'subscription-box',
  sv: 'subscription-box',
};

export const SEARCH = {
  es: 'busqueda',
  en: 'search',
  de: 'suchergebnisse',
  fr: 'recherche',
  nl: 'zoekresultaten',
  it: 'ricerca',
  sv: 'sokresultat',
};

export const PROJECTS_OH = {
  es: `${PROJECTS.es}/overharvest`,
  en: `${PROJECTS.en}/overharvest`,
  de: `${PROJECTS.de}/overharvest`,
  fr: `${PROJECTS.fr}/overharvest`,
  nl: `${PROJECTS.nl}/overharvest`,
  it: `${PROJECTS.it}/overharvest`,
  sv: `${PROJECTS.sv}/overharvest`,
};

export const CONTACT = {
  es: 'contacto',
  en: 'contact',
  de: 'kontakt',
  fr: 'contact',
  nl: 'contact',
  it: 'contatto',
  sv: 'kontakt',
};

export const MY_GARDEN = {
  es: 'private-zone/my-garden',
  en: 'private-zone/my-garden',
  de: 'private-zone/my-garden',
  fr: 'private-zone/my-garden',
  nl: 'private-zone/my-garden',
  it: 'private-zone/my-garden',
  sv: 'private-zone/my-garden',
};

export const MANIFESTO = {
  es: 'manifiesto',
  en: 'manifesto',
  de: 'manifest',
  fr: 'manifeste',
  nl: 'manifesteren',
  it: 'manifesto',
  sv: 'manifestera',
};

export const DOWNLOAD_APP_LANGING = {
  es: 'descarga-la-app',
  fr: 'telechargez-application',
  en: 'download-app',
  de: 'die-anwendung-herunterladen',
  it: 'scarica-l-app',
  nl: 'app-downloaden',
  sv: 'ladda-ner-app',
};

export const CUSTOM_BOX = {
  es: 'custom-boxes',
  en: 'custom-boxes',
  de: 'custom-boxes',
  fr: 'custom-boxes',
  nl: 'custom-boxes',
  it: 'custom-boxes',
  sv: 'custom-boxes',
};

export const LANDING_DRAFT = 'draft';

export const CHECKOUT_SECTION_PARAM = 'section';
export const MY_ORDER = 'my-order';

export const NAVIGATION_EVENTS: Record<Events, string> = {
  [Events.NOT_AVAILABLE_GIFT]: 'events/not-available-gift',
};
