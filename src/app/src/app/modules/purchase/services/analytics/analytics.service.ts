import { Injectable, Injector } from '@angular/core';
import { CheckoutStoreService } from '../store/checkout-store.service';
import { PRODUCT_TYPE } from '@app/constants/product.constants';
import {
  CountryService,
  DEFAULT_LIST_NAME,
  LangService,
  StorageService,
  TrackingConstants,
  TrackingService,
} from '@app/services';
import { IEcommerceTracking, UnknownObjectType } from '@app/interfaces';
import { ORDER_TYPE } from '@app/constants/order.constants';

@Injectable()
export class CheckoutAnalyticsService {
  private store: CheckoutStoreService;

  constructor(
    public injector: Injector,
    public langSrv: LangService,
    public trackingSrv: TrackingService,
    public countrySrv: CountryService,
    private storageSrv: StorageService,
  ) {
    this.store = this.injector.get(CheckoutStoreService);
  }

  public trackProductsAnalytics(step: string): void {
    const productsAnalytics = this.getProductsAnalytics();

    this.trackEventHandler(step, productsAnalytics);
  }

  public trackGA4Analytics(step: string): void {
    const customEventData = {
      cf_page_title: '',
      page_type: '',
      language: this.langSrv.getCurrentLang(),
      country_delivery: this.countrySrv.getCurrentCountry()?.iso,
    };
    const GA4_CF_PAGE_TITLE = this.getTrackingGA4PageTitle(step);

    customEventData.page_type = TrackingConstants.GTM4.PAGE_TYPE.CHECKOUT;
    customEventData.cf_page_title = GA4_CF_PAGE_TITLE;
    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PAGE_VIEW, false, customEventData);

    step !== TrackingConstants.GTM4.CHECKOUT_OK_CODE && this.trackGA4Event(step);
  }

  public trackGA4Event(step: string): void {
    const EVENT_NAME = this.getTrackingGA4EventName(step);
    const items: IEcommerceTracking[] = this.analyticsProductsToGA4(this.store.products);

    this.trackingSrv.trackEventGA4(EVENT_NAME, true, { items });
  }

  private getProductsAnalytics(): any[] {
    const products = this.store.products;
    const analyticsProducts = [];

    if (products?.length) {
      for (const product of products) {
        if (product.type !== PRODUCT_TYPE.ECOMMERCE) {
          const variant =
            product.type === 'OVERHARVEST'
              ? TrackingConstants.GTM.PARAMS.OVERHARVEST
              : product.type === 'ONE_SHOT_RENEWAL' || product.type === 'MULTI_SHOT_RENEWAL'
              ? TrackingConstants.GTM.PARAMS.RENEW
              : product.type === 'MULTI_SHOT_SINGLE_BOXES'
              ? TrackingConstants.GTM.PARAMS.SB
              : TrackingConstants.GTM.PARAMS.ADOPT;

          const calculatedQuantity = product.numMasterBoxes || 1;

          analyticsProducts.push({
            name: product.up.code,
            id: product.up._id,
            category: product.up._m_up[this.langSrv.getCurrentLang()],
            quantity:
              variant === TrackingConstants.GTM.PARAMS.ADOPT || variant === TrackingConstants.GTM.PARAMS.RENEW ? 1 : calculatedQuantity,
            price:
              variant === TrackingConstants.GTM.PARAMS.ADOPT || variant === TrackingConstants.GTM.PARAMS.RENEW
                ? product.price
                : product.price / calculatedQuantity,
            variant,
          });
        }
      }
    }

    return analyticsProducts;
  }

  public analyticsProductsToGA4(analyticsProducts: UnknownObjectType[]): IEcommerceTracking[] {
    const products: IEcommerceTracking[] = [];

    analyticsProducts?.map((product) => {
      const item: IEcommerceTracking | UnknownObjectType = {};
      const variant =
        product.type === ORDER_TYPE.ORDER_OVERHARVEST
          ? TrackingConstants.ITEM_VARIANT.OH
          : product.type === ORDER_TYPE.ONE_SHOT_RENEWAL || product.type === ORDER_TYPE.MULTI_SHOT_RENEWAL
          ? TrackingConstants.ITEM_VARIANT.RENEW
          : product.type === ORDER_TYPE.MULTI_SHOT_SINGLE_BOXES
          ? TrackingConstants.ITEM_VARIANT.SB
          : TrackingConstants.ITEM_VARIANT.ADOPT;
      const calculatedQuantity = product.numMasterBoxes || 1;
      const PRODUCT_CODE = product.up?.code;
      const trackingProjectAlreadyVisited = PRODUCT_CODE && this.storageSrv.get(PRODUCT_CODE);
      const listName = trackingProjectAlreadyVisited?.item_list_name ?? DEFAULT_LIST_NAME;
      const position = trackingProjectAlreadyVisited?.index ?? this.trackingSrv.getPosition();

      item.index = position;
      item.item_brand = product.farm?._m_name?.en;
      item.currency = product.currency?.crowdfarmer?.currency;
      item.price = product.price;
      item.item_variant = variant;
      item.quantity = calculatedQuantity;
      item.item_id = product.up?._id;
      item.item_category = product.up?._m_category?.en;
      item.item_category2 = product.up?._m_subcategory?.en;
      item.item_category3 = product.up?._m_variety?.en;
      item.item_category4 = product.up?._m_subvariety?.en;
      item.item_list_name = listName;
      item.item_name = PRODUCT_CODE;
      item.product_code = PRODUCT_CODE;

      products.push(item as IEcommerceTracking);
    });

    return products;
  }

  private trackEventHandler(step: string, analyticsProducts: any[]): void {
    this.trackingSrv.trackEvent(this.getTrackingGmtEvent(step), true, {
      checkout: {
        actionField: { step },
        products: analyticsProducts,
      },
    });
  }

  private getTrackingGmtEvent(step: string): string {
    return TrackingConstants.trackingGmtEventMap.get(step) as string;
  }

  public getTrackingGA4PageTitle(step: string): string {
    return TrackingConstants.trackingGA4PageTitleMap.get(step) as string;
  }

  private getTrackingGA4EventName(step: string): string {
    return TrackingConstants.trackingGA4EventNameMap.get(step) as string;
  }
}
