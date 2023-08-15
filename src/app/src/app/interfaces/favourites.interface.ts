export const FAVOURITES_PARAMS = 'favoritesActiveParams';

export enum FavouritesSection {
  FM = 'FM',
  HOME = 'Home',
  LANDING = 'Landing',
  USER_ACCOUNT = 'UserAccount',
  CROSS_SELLING = 'Crosselling',
  DETAIL = 'Detail',
}

export interface FavouriteParams {
  isFavFMActive: boolean;
  isFavHomeActive: boolean;
  isFavLandingActive: boolean;
  isFavUAActive: boolean;
}

export interface FavouriteInfoReq {
  type: string;
  isFavourite: boolean;
  platform: string;
  source: string;
  country: string;
}

export interface FavouriteInfoGetReq {
  country: string;
  showSeals: boolean;
  start: number;
  limit: number;
}

export interface FavouriteStoragePosition {
  tab: number;
  adoptions: {
    page: number;
    param: number;
  };
  boxes: {
    page: number;
    param: number;
  };
}

export interface FavouriteLocalStorage {
  project: any;
  type: string;
  source: string;
  index: number;
  agroupmentName: string;
  path?: string;
  scroll?: number;
}

export interface FavouriteTrackingParameters {
  project: any;
  tracking: {
    index: number;
    agroupmentName: string;
  };
  type: string;
  source: string;
  path?: string;
  isMiniCartGA4?: boolean;
}

export interface Favourites {
  adoptions: {
    list: [];
    totalFavs: number;
  };
  boxes: {
    list: [];
    totalFavs: number;
  };
}

export interface FavouriteInfo {
  data: FavouriteInfoReq;
  id: string;
}

export const LOCAL_STORAGE_FAVORITE_KEY = 'savedFavourite';
