import { TranslationLang } from '@app/constants/app.constants';
import { CS_MINI_CART } from '../../constants/cross-selling.constants';
import { TrackingGA4ImpressionIds } from '../../enums/filters.enum';

/**
 * File to define analytics constants to be used across components and services
 */
export class TrackingConstants {
  public static DEFAULT_TRACKING_LANGUAGE = TranslationLang.EN;
  // CONSTANTS FOR GTM
  public static GTM = {
    EVENTS: {
      CONTENT: 'content',
      LOGOUT: 'logout',
      LOGIN: 'login',
      REGISTER: 'register',
      NEWSLETTER: 'newsletter',
      OPEN_NEWSLETTER: 'Open subscription pop-up',
      ERROR: 'error',
      PURCHASE: 'purchase',
      REFUND: 'refund',
      CHECKOUT: 'checkout',
      CHECKOUT2: 'checkout 2',
      CHECKOUT3: 'checkout 3',
      CHECKOUT4: 'checkout 4',
      ADD_TO_CART: 'addToCart',
      IMPRESSION: 'impression',
      PRODUCT_CLICK: 'productClick',
      PRODUCT_DETAIL: 'productDetail',
      REMOVE_FROM_CART: 'removeFromCart',
      SEARCH_OK: 'search_OK',
      SEARCH_KO: 'search_KO',
      FILTER: 'filter',
      OOSZ: 'Out of shipment zone confirm message',
    },
    ACTIONS: {
      OVERHARVEST: 'overharvest',
      PURCHASE_MODULE: 'purchaseModule',
      PLAN_ALL: 'plandelivery-btn-addall',
      CROSSSELLING: 'csCart',
      PLAN_DELIVERY: 'Plan delivery',
      PLAN_DELIVERY_DETAILS: 'Plan delivery details',
      PLAN_DELIVERY_DETAILS_2: 'Plan delivery details2',
      RENEW: 'Renew',
      RENEW_DETAILS: 'Renew details',
      REORDER: 'Reorder',
      HOME: 'Home',
      FARMER_MARKET: 'Farmers Market',
    },
    PARAMS: {
      CROWDFARMER: 'crowdfarmer',
      AUTO: 'auto',
      MANUAL: 'manual',
      FB: 'facebook',
      GOOGLE: 'google',
      OVERHARVEST: 'OH',
      SB: 'SB',
      ADOPT: 'adopt',
      RENEW: 'renew',
    },
    PAGE_TYPE: {
      FARMER: 'farmer',
    },
  };

  public static GTM4 = {
    EVENTS: {
      PAGE_VIEW: 're_name_page',
      VIEW_ITEM_LIST: 'view_item_list',
      SELECT_ITEM: 'select_item',
      VIEW_ITEM: 'view_item',
      ADD_TO_CART: 'add_to_cart',
      REMOVE_FROM_CART: 'remove_from_cart',
      VIEW_CART: 'view_cart',
      BEGIN_CHECKOUT: 'begin_checkout',
      ADD_SHIPPING_INFO: 'add_shipping_info',
      ADD_PAYMENT_INFO: 'add_payment_info',
      PURCHASE: 'purchase',
      REFUND: 'refund',
      ADD_TO_WISHLIST: 'add_to_wishlist',
      REMOVE_FROM_WISHLIST: 'remove_from_wishlist',
    },
    CF_PAGE_TITLE: {
      HOME: 'Home',
      LOGIN_REGISTER: 'Login_Register',
      SEARCH_RESULTS_OK_ALL: 'Search_Results/All',
      SEARCH_RESULTS_OK_ADOPTIONS: 'Search_Results/Adoptions',
      SEARCH_RESULTS_OK_OH: 'Search_Results/Overharvest',
      SEARCH_RESULTS_KO_ALL: 'Search_Results/All/KO',
      SEARCH_RESULTS_KO_ADOPTIONS: 'Search_Results/Adoptions/KO',
      SEARCH_RESULTS_KO_OH: 'Search_Results/Overharvest/KO',
      SEARCH_FILTERS_RESULTS_SUFFIX: '/Filters_Results',
      SEARCH_FILTERS_ONE_CATEGORY_PREFIX: 'Search_Results/Categories/',
      FARMERS_MARKET_ADOPTIONS: 'Adoptions/List_Page',
      FARMERS_MARKET_OVERHARVEST: 'Overharvest/List_Page',
      ADOPTIONS_PDP_PREFIX: 'Adoptions/Detail_Page/',
      OVERHARVEST_PDP_PREFIX: 'Overharvest/Detail_Page/',
      CHECKOUT_STEP1: 'Checkout_Cart/Step_1',
      CHECKOUT_STEP2: 'Checkout_Shipping/Step_2',
      CHECKOUT_STEP3: 'Checkout_Payment/Step_3',
      CHECKOUT_STEP4_OK: 'Checkout_Purchase/Step_4_OK',
      CHECKOUT_STEP4_KO: 'Checkout_Purchase/Step_4_KO',
      MANIFESTO: 'Manifesto',
      ACCOUNT_MY_GARDEN: 'Account/My_Garden',
      ACCOUNT_MY_ORDERS: 'Account/My_Orders',
      ACCOUNT_MY_PROFILE: 'Account/My_Profile',
      ACCOUNT_MY_WISHLIST: 'Account/My_Wishlist',
      ACCOUNT_MY_ADDRESSES: 'Account/My_Addresses',
      ACCOUNT_MY_PAYMENT_METHODS: 'Account/My_Payment_Methods',
      ECOMMERCE_CATALOG : 'Ecommerce_Custom_Box/List_Page',
      ECOMMERCE_DETAIL : 'Ecommerce_Custom_Box/Detail_Page/{article}}',
      ECOMMERCE_BASKET : 'Ecommerce_Custom_Box/Mini_Cart'
    },
    PAGE_TYPE: {
      HOME: 'Home',
      LOGIN_REGISTER: 'Login_Register',
      SEARCH_RESULTS_OK: 'Search_Results_OK',
      SEARCH_RESULTS_KO: 'Search_Results_KO',
      SEARCH_FILTERS_ONE_CATEGORY: 'Search_Results_Categories',
      FARMERS_MARKET_ADOPTIONS: 'Adoptions_PLP',
      FARMERS_MARKET_OVERHARVEST: 'Overharvest_PLP',
      ADOPTIONS_PDP: 'Adoptions_PDP',
      OVERHARVEST_PDP: 'Overharvest_PDP',
      CHECKOUT: 'Checkout',
      MANIFESTO: 'Manifesto',
      MY_ACCOUNT: 'My_Account',
      ECOMMERCE_CATALOG : 'Ecommerce_Custom_Box_PLP',
      ECOMMERCE_DETAIL : 'Ecommerce_Custom_Box_PDP',
      ECOMMERCE_BASKET : 'Ecommerce_Custom_Box_Mini_Cart'
    },
    CATEGORY_CODE_EN_NAME_MAPPING: {
      '01': 'Fruits',
      '02': 'Dairy',
      '03': 'Fats_and_Oils',
      '04': 'Vegetables_and_Legumes',
      '05': 'Cereals',
      '06': 'Sweets',
      '07': 'Confectionary',
      '08': 'Condiments',
      '09': 'Beverages',
      // eslint-disable-next-line quote-props
      '10': 'Others',
      // eslint-disable-next-line quote-props
      '11': 'Mushrooms',
    },
    CHECKOUT_OK_CODE: '4_OK',
    CHECKOUT_KO_CODE: '4_KO',
  };

  public static WISHLIST_PREFIX = 'Whislist/';

  public static WISHLIST = {
    FM: {
      BOXES: this.WISHLIST_PREFIX + TrackingGA4ImpressionIds.FARMERS_MARKET_OH,
      ADOPTIONS: this.WISHLIST_PREFIX + TrackingGA4ImpressionIds.FARMERS_MARKET_ADOPTIONS,
    },

    Search: {
      BOXES: this.WISHLIST_PREFIX + TrackingGA4ImpressionIds.SEARCH_RESULTS_OH,
      ADOPTIONS: this.WISHLIST_PREFIX + TrackingGA4ImpressionIds.SEARCH_RESULTS_ADOPT,
      ALL: this.WISHLIST_PREFIX + TrackingGA4ImpressionIds.SEARCH_RESULTS_ALL,
    },

    Search_CS: {
      BOXES: this.WISHLIST_PREFIX + TrackingGA4ImpressionIds.SEARCH_NO_RESULTS + '/You_might_also_like',
      ADOPTIONS: this.WISHLIST_PREFIX + TrackingGA4ImpressionIds.SEARCH_NO_RESULTS + '/Available_adoptions',
      ALL: this.WISHLIST_PREFIX + TrackingGA4ImpressionIds.SEARCH_RESULTS_ALL,
    },

    Detail: {
      BOXES: this.WISHLIST_PREFIX + TrackingGA4ImpressionIds.FARMERS_MARKET_OH + '/Detail_Page',
      ADOPTIONS: this.WISHLIST_PREFIX + TrackingGA4ImpressionIds.FARMERS_MARKET_ADOPTIONS + '/Detail_Page',
    },

    Home: {
      BOXES: this.WISHLIST_PREFIX + this.GTM4.CF_PAGE_TITLE.HOME,
      ADOPTIONS: this.WISHLIST_PREFIX + this.GTM4.CF_PAGE_TITLE.HOME,
    },

    Crosselling_Cart: {
      ADOPTIONS: this.WISHLIST_PREFIX + 'CS_Cart/Available_adoptions',
      BOXES: this.WISHLIST_PREFIX + 'CS_Cart/You_might_also_like',
    },

    Crosselling_Mini_cart: {
      BOXES: this.WISHLIST_PREFIX + CS_MINI_CART + '/You_might_also_like',
    },

    Crosselling: {
      BOXES: `${this.WISHLIST_PREFIX}'CS_'${TrackingGA4ImpressionIds.FARMERS_MARKET_OH}/You_might_also_like`,
      ADOPTIONS: `${this.WISHLIST_PREFIX}'CS_'${TrackingGA4ImpressionIds.FARMERS_MARKET_ADOPTIONS}/Available_adoptions`,
    },

    UserAccount: {
      ADOPTION: `${this.WISHLIST_PREFIX}'/Account/Adoptions'`,
      BOXES: `${this.WISHLIST_PREFIX}'/Account/Overharvest'`,
    },
  };

  public static trackingGmtEventMap: Map<string, TrackingConstants> = new Map([
    ['1', this.GTM.EVENTS.CHECKOUT],
    ['2', this.GTM.EVENTS.CHECKOUT2],
    ['3', this.GTM.EVENTS.CHECKOUT3],
    ['4', this.GTM.EVENTS.CHECKOUT4],
  ]);
  public static trackingGA4PageTitleMap: Map<string, TrackingConstants> = new Map([
    ['1', this.GTM4.CF_PAGE_TITLE.CHECKOUT_STEP1],
    ['2', this.GTM4.CF_PAGE_TITLE.CHECKOUT_STEP2],
    ['3', this.GTM4.CF_PAGE_TITLE.CHECKOUT_STEP3],
    [this.GTM4.CHECKOUT_OK_CODE, this.GTM4.CF_PAGE_TITLE.CHECKOUT_STEP4_OK],
    [this.GTM4.CHECKOUT_KO_CODE, this.GTM4.CF_PAGE_TITLE.CHECKOUT_STEP4_KO],
  ]);
  public static trackingGA4EventNameMap: Map<string, TrackingConstants> = new Map([
    ['1', this.GTM4.EVENTS.VIEW_CART],
    ['2', this.GTM4.EVENTS.BEGIN_CHECKOUT],
    ['3', this.GTM4.EVENTS.ADD_SHIPPING_INFO],
    [this.GTM4.CHECKOUT_OK_CODE, this.GTM4.EVENTS.ADD_PAYMENT_INFO],
  ]);

  public static ITEM_VARIANT = {
    ADOPT: 'adopt',
    OH: 'oh',
    MIXED: 'mixed',
    RENEW: 'renew',
    SB: 'multi_shot_single_boxes',
  };
}

export enum TrackingGA4Prefixes {
  HOME = 'Home/',
  FARMERS_MARKET_ADOPTIONS = 'Farmers_Market_Adoptions/',
  FARMERS_MARKET_OH = 'Farmers_Market_OH/',
  SEARCH_RESULTS = 'Search/',
  MARKETING_LANDING = 'MKT_Landing/',
}

export const DEFAULT_LIST_NAME = 'Unknown';
