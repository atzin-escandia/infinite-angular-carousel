export enum CROSS_SELLING_LOCATIONS {
  CART = 'Cart',
  UP_PAGE = 'UpPage',
  OH_ADD_TO_CART = 'Oh',
  THANKS_LANDING = 'Thanks',
  CONTACT_PAGE = 'Contact',
  GROUP_ORDER_INVITATION = 'GoInvitation',
  FARMERS_MARKET = 'FarmersMarket',
}

export const CS_MINI_CART = 'CS_Mini_Cart/You_might_also_like';

export const CS_SPECIFICATIONS = {
  crossSellingSB: {
    header: 'boxes to be planned',
    trackingListName: 'csGoInvitation SB',
    trackingGA4ListName: 'CS_GO/Single_Boxes',
  },
  ohProjects: {
    header: 'http://page.youmight-also-like.body',
    trackingListName: 'csGoInvitation OH',
    trackingGA4ListName: 'CS_GO/Overharvest',
  },
  adoptionProjects: {
    header: 'global.available-adoption.title',
    trackingListName: 'csGoInvitation Adoptions',
    trackingGA4ListName: 'CS_GO/Adoptions',
  },
  trackingActionName: 'csGoInvitation',
};

export const CS_SPECIFICATIONS_NO_RESULTS = {
  crossSellingSB: {
    header: 'boxes to be planned',
    trackingListName: 'csNoResults SB',
    trackingGA4ListName: 'Search_Results/No_results/Single_Boxes',
  },
  ohProjects: {
    header: 'http://page.youmight-also-like.body',
    trackingListName: 'csNoResults OH',
    trackingGA4ListName: 'Search_Results/No_results/You_might_also_like',
  },
  adoptionProjects: {
    header: 'global.available-adoption.title',
    trackingListName: 'csNoResults Adoptions',
    trackingGA4ListName: 'Search_Results/No_results/Available_adoptions',
  },
  trackingActionName: 'csNoResults',
};

export const MAX_CROSS_SELLING_LIMIT = 4;
