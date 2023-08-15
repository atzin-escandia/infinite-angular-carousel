import { Component, Injector, Input, ViewEncapsulation, OnInit, OnChanges } from '@angular/core';
import { BaseComponent } from '@components/base';
import { FavouritesSection } from '@interfaces/favourites.interface';
import { OVERHARVEST_SUFFIX } from '@app/pages/farmer/overharvest/constants/overharvest.constants';
import {
  RouterService,
  TrackingService,
  TrackingConstants,
  CartsService,
  ConfigService,
  StateService,
  TrackingGA4Prefixes,
  CountryService,
} from '@app/services';
import { TrackingImpressionIds } from '@app/enums/filters.enum';
import { IEcommerceTracking, UnknownObjectType } from '@app/interfaces';
import { OVERHARVEST } from '@app/pages/farmer/overharvest/constants/overharvest.constants';

@Component({
  selector: 'project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectCardComponent extends BaseComponent implements OnChanges, OnInit {
  @Input() adoption = true;
  @Input() agroupmentName?: string;
  @Input() home = true;
  // TODO: define farmer and up types
  @Input() project: any;
  @Input() countryName: string;
  @Input() index: number;
  @Input() block: number;
  @Input() lang: string;
  @Input() startLazyAt = 6;
  @Input() boxSkeleton = false;
  @Input() adoptionSkeleton = false;

  projectHref: string;
  projectRoute: string;
  ohAvailable = false;
  adoptionAvailable = false;
  isValidSeason = false;
  priceToShow = 0;
  isGiftAvailable = false;
  homeKey = FavouritesSection.HOME;

  constructor(
    public injector: Injector,
    public routerSrv: RouterService,
    private trackingSrv: TrackingService,
    private cartSrv: CartsService,
    public configSrv: ConfigService,
    public stateSrv: StateService,
    private countrySrv: CountryService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.project && this.setHref();
    this.isGiftAvailable = this.stateSrv.giftEnabled && this.project?.filters?.giftAvailable;
    if (this.project?.up) {
      const { ohUnits, ohDates, ohUnavailableDates, adoptionsUnits, adoptionDates,
        adoptionUnavailableDates } = this.project.filters;

      this.ohAvailable = this.project.up?.overharvestAllowed && ohUnits && ohDates?.first && !ohUnavailableDates;
      this.adoptionAvailable = adoptionsUnits && adoptionDates?.first && !adoptionUnavailableDates;
    }
    this.setPriceToShow();
    this.isValidSeason = !(this.project?.inactiveSeason || this.project?.emptySeason);
  }

  ngOnChanges(): void {
    this.project && this.setHref();
  }

  private setHref(): void {
    const type = this.adoption ? '' : OVERHARVEST_SUFFIX;
    const farmerSlug: string = this.project?.farmer?.slug;
    const projectUpSlug: string = this.project?.up?.upSlug || this.project?.up?._m_upSlug[this.lang];

    if (farmerSlug && projectUpSlug) {
      this.projectRoute = `farmer/${farmerSlug}/up/${projectUpSlug}${type}`;
      this.projectHref = `${this.lang}/${this.projectRoute}`;
    }
  }

  /**
   * Promotion handler
   */
  public clickPromotion(e: Event, project: any): void {
    e.preventDefault();
    if (project) {
      // UA
      const list = this.buildList();

      this.trackingSrv.setInterimList(list);
      this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.PRODUCT_CLICK, true, {
        click: {
          actionField: {list},
          products: [
            {
              name: project.code,
              id: project.up.id,
              category: project.up._m_up[this.langSrv.getCurrentLang()],
              brand: project.farmer.brandName,
              position: this.index + 1
            }
          ]
        }
      });

      // GA4
      const PRODUCT_CODE = project.code;
      const items: IEcommerceTracking[] = [];
      const listName = this.buildListName();
      const position = this.index + 1;

        // TODO: fill in with IEcommerceTracking
      items.push({
        index: position,
        item_brand: project.farm?._m_name?.en,
        currency: this.countrySrv.getCurrentCountry().currency,
        price: this.adoption ? project.filters?.price?.amount : project.filters?.ohPrice?.amount,
        item_variant: this.adoption
          ? TrackingConstants.ITEM_VARIANT.ADOPT
          : TrackingConstants.ITEM_VARIANT.OH,
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

      if (!this.home) {
        this.storageSrv.set(
          'projectsScrollTo',
          {
            block: this.block,
            id: `project-card-${this.index}`,
            adoptionTab: this.adoption
          },
          900
        );
      }
      this.routerSrv.navigate(this.projectRoute, this.lang, null, null, this.home ? null : true);
    }
  }

  public addToCart(project: any): void {
    if (project && !project.emptySeason && !project.inactiveSeason) {
      const isUberUp = project.up.typeUpSell === 'UBER_UPS';

      this.trackingSrv.trackEvent(
        TrackingConstants.GTM.EVENTS.ADD_TO_CART,
        true,
        {
          add: {
            products: [
              {
                price: project.filters.ohPrice.amount,
                quantity: 1,
                variant: TrackingConstants.GTM.PARAMS.OVERHARVEST,
                name: project.code,
                id: project.up.id,
                category: project.up._m_up[this.langSrv.getCurrentLang()],
                brand: project.farmer.brandName,
                position: this.index + 1
              }
            ]
          }
        },
        this.home ? TrackingConstants.GTM.ACTIONS.HOME : TrackingConstants.GTM.ACTIONS.FARMER_MARKET
      );

      this.cartSrv.add(
        OVERHARVEST,
        {
          _id: project.up.id,
          _m_up: project.up._m_up,
          _m_slug: project.up._m_upSlug
        },
        null,
        null,
        project.masterBox.id,
        {
          numMasterBoxes: 1,
        },
        null,
        project.farmer.slug,
        {oneShot: false, multiShot: false, uberUp: isUberUp}
      );

      project.up.masterBox = project.masterBox;
      this.trackGA4AddToCart(project);

      this.popoverSrv.open('ProductNotificationComponent', 'header-notification-container', {
        inputs: {
          product: {
            type: 'OVERHARVEST',
            name: project.farm?.name,
            up: project.up,
            price: project.filters?.ohPrice?.amount,
            boxes: 1
          },
          imageURL: project.up?.cardOHImageURL,
          customClose: () => {
            this.popoverSrv.close('ProductNotificationComponent');
            delete project.up?.masterBox;
          }
        },
        outputs: {}
      });
    }
  }

  /**
   * This function shows the most suitable price for every case (depends on the tab you are)
   * checking if there are adoptions/OH units, dates and prices available.
   *
   * @returns the price to show in the project card.
   */
  public setPriceToShow(): void {
    const canShowAdoptionPrice = this.adoptionAvailable && this.project?.filters?.price;
    const canShowOhPrice = this.ohAvailable && this.project?.filters?.ohPrice;

    if (this.adoption) {
      // If we are in the Adoption Tab, we priorize adoption price
      if (canShowAdoptionPrice) {
        this.priceToShow = this.project?.filters?.price?.amount;
      } else if (canShowOhPrice) {
        this.priceToShow = this.project?.filters?.ohPrice?.amount;
      }
    } else {
      // However, if we are in the OH Tab, we show ohPrice directly
      this.priceToShow = this.project?.filters?.ohPrice?.amount;
    }
  }

  // to be deprecated when UA is deprecated
  private buildList(): string {
    let list = '';

    if (this.home) {
      if (this.adoption) {
        list = 'Home Adoptions';
      } else {
        list = 'Home OH';
      }
    } else {
      if (this.adoption) {
        list = TrackingImpressionIds.FARMERS_MARKET_ADOPTIONS;
      } else {
        list = TrackingImpressionIds.FARMERS_MARKET_OH;
      }
    }

    return list;
  }

  private buildListName(): string {
    let listName = '';
    let prefixToApply = '';

    prefixToApply = this.home
      ? TrackingGA4Prefixes.HOME
      : this.adoption
      ? TrackingGA4Prefixes.FARMERS_MARKET_ADOPTIONS
      : TrackingGA4Prefixes.FARMERS_MARKET_OH;

    listName = this.trackingSrv.buildListName(this.agroupmentName, prefixToApply);

    return listName;
  }

  private trackGA4AddToCart(project: UnknownObjectType): void {
    if (!project) {
      return;
    }
    const PRODUCT_CODE = project.code;
    const items: IEcommerceTracking[] = [];
    const listName = this.buildListName();
    const position = this.index + 1;
    const farmName = project?.farm?._m_name?.en;

    this.trackingSrv.setInterimGA4List(listName);

    items.push({
      index: position,
      item_brand: farmName,
      currency: this.countrySrv.getCurrentCountry().currency,
      price: project.filters?.ohPrice?.amount,
      item_variant: TrackingConstants.ITEM_VARIANT.OH,
      quantity: 1,
      item_id: project._id,
      item_category: project.up?._m_category?.en, // ask BE to provide this?
      item_category2: project.up?._m_subcategory?.en, // ask BE to provide this?
      item_category3: project.up?._m_variety?.en,
      item_category4: project.up?._m_subvariety?.en, // ask BE to provide this?
      item_list_name: listName,
      item_name: PRODUCT_CODE,
      // product_id: e.code, product category id ?
      product_code: PRODUCT_CODE,
      // product_project_code: product_id + e.code
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
    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.ADD_TO_CART, true, { items });
  }
}
