import { Injectable, Injector } from '@angular/core';
import { MasterBox } from '@interfaces/master-box.interface';
import { CardService } from '@modules/farmers-market/services/card.service';
import { TranslocoService } from '@ngneat/transloco';
import { IEcommerceTracking, UnknownObjectType } from '@app/interfaces';
import { TrackingConstants, TrackingGA4Prefixes, TrackingService } from '../tracking';
import { OVERHARVEST, OVERHARVEST_KEY, UBER_UPS } from '@pages/farmer/up/constants/up.constants';
import { CFCurrencyPipe } from '@pipes/currency';
import { TranslateSealsPipe } from '@pipes/translate-seals';
import { BaseService } from '../base';
import { CartsService } from '../carts';
import { LangService } from '../lang';
import { PopoverService } from '../popover';
import { PAGE_TYPES } from '@app/modules/farmers-market/types/page.types';
import { TrackingImpressionIds } from '@app/enums/filters.enum';

@Injectable({
  providedIn: 'root',
})
export class AgroupmentService extends BaseService {
  currentLang: string;
  dynamicFunctionsObject: any;

  constructor(
    public injector: Injector,
    public langSrv: LangService,
    private cartSrv: CartsService,
    private trackingSrv: TrackingService,
    public cardSrv: CardService,
    private popoverSrv: PopoverService,
    public translocoSrv: TranslocoService,
    public sealsPipeSrv: TranslateSealsPipe,
    public currencyPipeSrv: CFCurrencyPipe
  ) {
    super(injector);
    this.currentLang = this.langSrv.getCurrentLang();
  }

  public trackClickPromotion(project: any, index: number, type: string, list?: string): void {
    if (!type || !project) {
      return;
    }
    const PRODUCT_CODE = project.code;
    const items: IEcommerceTracking[] = [];
    const listNamePrefix =
      type === PAGE_TYPES.ADOPTIONS ? TrackingGA4Prefixes.FARMERS_MARKET_ADOPTIONS : TrackingGA4Prefixes.FARMERS_MARKET_OH;
    const listName = this.trackingSrv.buildListName(list, listNamePrefix);
    const position = index + 1;

    if (!list || list === '') {
      list = type === PAGE_TYPES.ADOPTIONS ? TrackingImpressionIds.FARMERS_MARKET_ADOPTIONS : TrackingImpressionIds.FARMERS_MARKET_OH;
    }

    this.trackingSrv.setInterimList(list);
    this.trackingSrv.setInterimGA4List(listName);
    this.trackingSrv.setPosition(position);
    this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.PRODUCT_CLICK, true, {
      click: {
        actionField: { list },
        products: [
          {
            name: PRODUCT_CODE,
            id: project.up?.id,
            category: project.up?._m_up[this.langSrv.getCurrentLang()],
            brand: project.farmer?.brandName,
            position,
          },
        ],
      },
    });

    // TODO: fill in with IEcommerceTracking
    items.push({
      index: position,
      item_brand: project.farm?._m_name?.en,
      currency: project.filters?.price?.currency?.crowdfarmer?.currency,
      price: type === PAGE_TYPES.ADOPTIONS ? project.filters?.price?.amount : project.filters?.ohPrice?.amount,
      item_variant: type === PAGE_TYPES.ADOPTIONS ? TrackingConstants.ITEM_VARIANT.ADOPT : TrackingConstants.ITEM_VARIANT.OH,
      quantity: 1,
      item_id: project.up?.id,
      item_category: project.up?.categoryName,
      item_category2: project.up?.subcategoryName,
      item_category3: project.up?._m_variety?.en,
      item_category4: project.up?.subvariety,
      item_list_name: listName,
      item_name: PRODUCT_CODE,
      // cart_number_items
      // product_id: project.code, product category id ?
      product_code: PRODUCT_CODE,
      // product_project_code: product_id + project.code
      // product_page:
      // product_delivery_plan:
      // product_cost_calculator:
      // product_stock:
      // product_units_left:
      // product_days_left:
      // farmer_country:
      // product_soon:
      // link_type:
      // search_term:
      // product_gift:
    } as IEcommerceTracking);

    const currentItem: IEcommerceTracking = items[0];
    const productCode: string = currentItem && currentItem.product_code;

    productCode && this.trackingSrv.saveTrackingStorageProject(productCode, currentItem);
    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.SELECT_ITEM, true, { items });
  }

  addToCart(project: any, index: number, home = false, type: string, title: string): void {
    if (
      project &&
      !project.emptySeason &&
      !project.inactiveSeason &&
      this.cardSrv.isMbAvailable(project.selectedMb || project?.filters?.masterBoxes[0])
    ) {
      const isUberUp = project.up?.typeUpSell === UBER_UPS;

      this.trackingSrv.trackEvent(
        TrackingConstants.GTM.EVENTS.ADD_TO_CART,
        true,
        {
          add: {
            products: [
              {
                price: project.selectedMb?.ohPrice?.amount || project.filters?.masterBoxes[0]?.ohPrice?.amount,
                quantity: 1,
                variant: TrackingConstants.GTM.PARAMS.OVERHARVEST,
                name: project.code,
                id: project.up?.id,
                category: project.up?._m_up[this.langSrv.getCurrentLang()],
                brand: project.farmer?.brandName,
                position: index + 1,
              },
            ],
          },
        },
        home ? TrackingConstants.GTM.ACTIONS.HOME : TrackingConstants.GTM.ACTIONS.FARMER_MARKET
      );

      this.cartSrv.add(
        OVERHARVEST_KEY,
        {
          _id: project.up?.id,
          _m_up: project.up?._m_up,
          _m_slug: project.up?._m_upSlug,
        },
        null,
        null,
        project.selectedMb?.id || project.filters?.masterBoxes[0]?.id,
        {
          numMasterBoxes: 1,
        },
        null,
        project.farmer.slug,
        { oneShot: false, multiShot: false, uberUp: isUberUp }
      );

      project.up.masterBox = project.selectedMb || project.filters?.masterBoxes[0];

      this.trackGA4AddToCart(project, index, type, title);
      this.popoverSrv.open('ProductNotificationComponent', 'header-notification-container', {
        inputs: {
          product: {
            type: OVERHARVEST,
            name: project.farm?.name[this.currentLang],
            up: project.up,
            price: project.selectedMb?.ohPrice?.amount || project.filters?.masterBoxes[0]?.ohPrice?.amount,
            boxes: 1,
          },
          imageURL: project.up?.cardOHImageURL,
          customClose: () => {
            this.popoverSrv.close('ProductNotificationComponent');
            delete project.up?.masterBox;
          },
        },
        outputs: {},
      });
    }
  }

  setSelectedMb(event: any, project: any): any {
    return (project.selectedMb = project?.filters?.masterBoxes?.find((mb: MasterBox) => mb.id === event?.id));
  }

  setProjectDataOH(item: any): any {
    return {
      imageUrl: item.up?.pictureURL,
      imgAlt: 'Picture',
      title: item.up._m_title[this.currentLang],
      farmerName: item.farmer.name,
      farmName: item.farm._m_name[this.currentLang],
      country: item.farm.country,
      deliveryDate: this.cardSrv.setDeliveryDates(item),
      weight: this.cardSrv.getWeight(item),
      selectBoxSize: this.cardSrv.isMBsSelectorVisibleForOh(item.filters.masterBoxes),
      selectLabel: this.translocoSrv.translate<string>('page.box-size.drop'),
      options: this.cardSrv.setDiscount(item.mbsInfo, item.filters.masterBoxes),
      selectedOption: item.selectedOption || item?.defaultMb,
      selectDisabled: this.cardSrv.areAllMbsDisabled(item.filters.masterBoxes),
      buttonContent: this.translocoSrv.translate<string>('page.cart.buttom'),
      seals: this.sealsPipeSrv.transform(item.upSeals?.header),
      buttonDisabled: this.cardSrv.isButtonDisabled(item),
      price: this.currencyPipeSrv.transform(this.cardSrv.getMbOhPrice(item)),
      buttonHasIcon: false,
    };
  }

  setProjectDataAdoption(item: any): any {
    return {
      imageUrl: item.up.pictureURL,
      imgAlt: 'Picture',
      overline: this.cardSrv.getAdoptionText(item.up),
      title: item.up._m_title[this.currentLang],
      farmerName: item.farmer.name,
      farmName: item.farm._m_name[this.currentLang],
      country: item.farm.country,
      deliveryDate: this.cardSrv.setDeliveryDates(item),
      price: this.currencyPipeSrv.transform(this.cardSrv.getMbAdoptionPrice(item)),
      minWeight: this.cardSrv.getWeight(item),
      seals: this.sealsPipeSrv.transform(item.upSeals?.header),
      areMultipleMbs: false,
      hasFavorite: false,
      tagState: this.cardSrv.getTagState(item),
      imageTagIcon: null,
      tagText: this.translocoSrv.translate<string>(this.cardSrv.getTagText(item).key, {units: this.cardSrv.getTagText(item).params}),
    };
  }

  private trackGA4AddToCart(project: UnknownObjectType, index: number, type: string, title: string): void {
    if (!project) {
      return;
    }
    const PRODUCT_CODE = project.up?.code;
    const items: IEcommerceTracking[] = [];
    const listNamePrefix =
      type === PAGE_TYPES.ADOPTIONS ? TrackingGA4Prefixes.FARMERS_MARKET_ADOPTIONS : TrackingGA4Prefixes.FARMERS_MARKET_OH;
    const listName = this.trackingSrv.buildListName(title, listNamePrefix);
    // const listName = this.trackingSrv.getInterimGA4List();
    const position = index + 1;

    items.push({
      index: position,
      item_brand: project.farm?._m_name?.en,
      currency: project.up?.masterBox?.ohPrice?.currency?.crowdfarmer?.currency,
      price: this.cardSrv.getPrice(project),
      item_variant: type === PAGE_TYPES.ADOPTIONS ? TrackingConstants.ITEM_VARIANT.ADOPT : TrackingConstants.ITEM_VARIANT.OH,
      quantity: 1,
      item_id: project.up?.id,
      item_category: project.up?.categoryName,
      item_category2: project.up?.subcategoryName,
      item_category3: project.up?._m_variety?.en,
      item_category4: project.up?._m_subvariety?.en, // ask BE to provide this
      item_list_name: listName,
      item_name: PRODUCT_CODE,
      // cart_number_items
      // product_id: e.code, product category id ?
      product_code: PRODUCT_CODE,
      // product_project_code: product_id + e.code
      // product_page:
      // product_delivery_plan:
      // product_cost_calculator:
      // product_stock:
      // product_units_left:
      // product_days_left:
      // farmer_country:
      // product_soon:
      // link_type:
      // search_term:
      // product_gift:
    } as IEcommerceTracking);

    const currentItem: IEcommerceTracking = items[0];
    const productCode: string = currentItem && currentItem.product_code;

    productCode && this.trackingSrv.saveTrackingStorageProject(productCode, currentItem);
    this.trackingSrv.trackEventGA4( TrackingConstants.GTM4.EVENTS.ADD_TO_CART, true, { items });

  }
}
