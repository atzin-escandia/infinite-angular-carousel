import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  AuthService,
  CartsService,
  CountryService,
  DomService,
  FavouriteService,
  LangService,
  RouterService,
  StorageService,
  TrackingConstants,
  TrackingService,
} from '@app/services';
import { MasterBox } from '@interfaces/master-box.interface';
import { FarmersMarketService } from '@modules/farmers-market/farmers-market.service';
import { TranslocoService } from '@ngneat/transloco';
import { OVERHARVEST, UBER_UPS } from '@pages/farmer/up/constants/up.constants';
import { PopoverService } from '@services/popover';
import { CatalogueComponent } from '../catalogue/catalogue.component';
import { CardService } from '../../services/card.service';
import { IEcommerceTracking, UnknownObjectType } from '@app/interfaces';
import { PAGE_TYPES } from '../../types/page.types';
import { OVERHARVEST_KEY } from '@pages/farmer/up/constants/up.constants';

@Component({
  selector: 'boxes-catalogue',
  templateUrl: './boxes-catalogue.component.html',
  styleUrls: ['../catalogue/catalogue.component.scss'],
})
export class BoxesCatalogueComponent extends CatalogueComponent implements OnInit, OnChanges {

  constructor(
    public domSrv: DomService,
    public cartSrv: CartsService,
    public popoverSrv: PopoverService,
    public translocoSrv: TranslocoService,
    public langSrv: LangService,
    public routerSrv: RouterService,
    public route: ActivatedRoute,
    public router: Router,
    public location: Location,
    public farmersMarketSrv: FarmersMarketService,
    public cardSrv: CardService,
    public countrySrv: CountryService,
    public storageSrv: StorageService,
    public trackingSrv: TrackingService,
    public favouriteSrv: FavouriteService,
    public authSrv: AuthService
  ) {
    super(
      translocoSrv,
      langSrv,
      routerSrv,
      route,
      router,
      location,
      farmersMarketSrv,
      countrySrv,
      cardSrv,
      domSrv,
      storageSrv,
      trackingSrv,
      favouriteSrv,
      authSrv
    );
  }

  ngOnInit(): void {
    this.type = PAGE_TYPES.BOXES;
    super.ngOnInit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.projects.length && changes.projects?.previousValue !== changes.projects?.currentValue) {
      this.projects.forEach((project) => {
        project.options = this.cardSrv.setDiscount(project.mbsInfo, project.filters.masterBoxes);
        project.defaultMb = project.options.find((option: any) => option.id === project.defaultMb.id);
      });
    }
    super.ngOnChanges(changes);
  }

  addToCart(project: any, index: number, home = false): void {
    const availableMb = this.cardSrv.getAvailableMb(project.filters.masterBoxes);

    if (project && !project.emptySeason && !project.inactiveSeason && this.cardSrv.isMbAvailable(project.selectedMb || availableMb)) {
      const isUberUp = project.up.typeUpSell === UBER_UPS;

      this.trackingSrv.trackEvent(
        TrackingConstants.GTM.EVENTS.ADD_TO_CART,
        true,
        {
          add: {
            products: [
              {
                price: project.selectedMb?.ohPrice.amount || availableMb.ohPrice.amount,
                quantity: 1,
                variant: TrackingConstants.GTM.PARAMS.OVERHARVEST,
                name: project.code,
                id: project.up.id,
                category: project.up._m_up[this.langSrv.getCurrentLang()],
                brand: project.farmer.brandName,
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
          _id: project.up.id,
          _m_up: project.up._m_up,
          _m_slug: project.up._m_upSlug,
        },
        null,
        null,
        project.selectedMb?.id || availableMb.id,
        {
          numMasterBoxes: 1,
        },
        null,
        project.farmer.slug,
        { oneShot: false, multiShot: false, uberUp: isUberUp }
      );

      project.up.masterBox = project.selectedMb || availableMb;
      this.trackGA4AddToCart(project, index);

      this.popoverSrv.open('ProductNotificationComponent', 'header-notification-container', {
        inputs: {
          product: {
            type: OVERHARVEST,
            name: project.farm.name,
            up: project.up,
            price: project.selectedMb?.ohPrice.amount || availableMb.ohPrice.amount,
            boxes: 1,
          },
          imageURL: project.up.cardOHImageURL,
          customClose: () => {
            this.popoverSrv.close('ProductNotificationComponent');
            delete project.up.masterBox;
          },
        },
        outputs: {},
      });
    }
  }

  setSelectedMb(event: any, project: any): void {
    project.selectedMb = project.filters.masterBoxes.find((mb: MasterBox) => mb.id === event.id);
  }

  private trackGA4AddToCart(project: UnknownObjectType, index: number): void {
    if (!project) {
      return;
    }
    const PRODUCT_CODE = project.code;
    const items: IEcommerceTracking[] = [];
    const listName = this.setTrackingGA4IdImpressions();
    const farmName = project?.farm?._m_name?.en;
    const position = index + 1;

    items.push({
      index: position,
      item_brand: farmName,
      currency: project?.up?.masterBox?.ohPrice?.currency?.crowdfarmer?.currency,
      price: project?.up?.masterBox?.ohPrice?.amount,
      item_variant: TrackingConstants.ITEM_VARIANT.OH,
      quantity: 1,
      item_id: project?._id,
      item_category: project.up?._m_category?.en, // ask BE to provide this?
      item_category2: project.up?._m_subcategory?.en, // ask BE to provide this?
      item_category3: project.up?._m_variety?.en, // ask BE to provide this?
      item_category4: project.up?._m_subvariety?.en, // ask BE to provide this?
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
    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.ADD_TO_CART, true, { items });
  }
}
