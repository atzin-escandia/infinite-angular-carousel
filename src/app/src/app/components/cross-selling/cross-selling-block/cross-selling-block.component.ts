import { Component, Injector, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { BaseComponent } from '@components/base';
import { CrossSellingService, CartsService, TrackingService, TrackingConstants, CountryService, FavouriteService } from '@app/services';
import { CrosssellingNameComponent } from '@popups/crossselling-name-popup/crossselling-name';
import { ICrossSellingParams, IEcommerceTracking, UnknownObjectType } from '@app/interfaces';
import { SealsService } from '@pages/farmer/services/seals';
import { CS_MINI_CART, MAX_CROSS_SELLING_LIMIT } from '@app/constants/cross-selling.constants';
import { ORDER_TYPE } from '@app/constants/order.constants';

@Component({
  selector: 'cross-selling-block-component',
  templateUrl: './cross-selling-block.component.html',
  styleUrls: ['./cross-selling-block.component.scss'],
})
export class CrossSellingBlockComponent extends BaseComponent implements OnInit {
  @Input() params: ICrossSellingParams;
  @Input() activeCS: string;
  @Input() specifications: any;
  @Input() products = [];
  @Input() buyNowText = false;
  @Input() fromFM = false;
  @Input() isLateralCs = false;
  @Input() loadOnInit = true;

  @Output() public crossSellingProductAdded = new EventEmitter();
  @Output() public crossSellingProductReceived = new EventEmitter<boolean>();

  CROSS_SELLING_ELEMENTS = MAX_CROSS_SELLING_LIMIT;
  public crossSellingPromos = {
    ohProjects: [],
    adoptionProjects: [],
  };
  public loaded = false;

  constructor(
    public injector: Injector,
    private sealsSrv: SealsService,
    private crossSellingSrv: CrossSellingService,
    private cartSrv: CartsService,
    private trackingSrv: TrackingService,
    private countrySrv: CountryService,
    private cartsSrv: CartsService,
    public favouriteSrv: FavouriteService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadOnInit && void this.initCrossSelling();

    this.favouriteSrv.setCrowdfarmer();
  }

  async initCrossSelling(params: ICrossSellingParams = this.params): Promise<void> {
    if (this.params) {
      await this.sealsSrv.setAllSeals();
      const currentCountry = params.country || this.countrySrv.getCountry();

      this.crossSellingPromos = await this.crossSellingSrv.getCrossSelling(currentCountry);
      this.loadPromos();
      this.crossSellingProductReceived.emit(true);
      this.loaded = true;
    }
  }

  loadPromos(): void {
    for (const promosBlock in this.crossSellingPromos) {
      if (this.crossSellingPromos[promosBlock].length > 0) {
        const cart = this.cartSrv.get();
        const cartIds = cart?.map((e) => e._up) || [];

        this.crossSellingPromos[promosBlock] = this.crossSellingPromos[promosBlock].filter(
          (product) => !cartIds.includes(product.cart._up)
        );

        const impressions = [];
        const items = [];
        const list = this.specifications[promosBlock]?.trackingListName;
        const listName = this.specifications[promosBlock]?.trackingGA4ListName;

        for (const [i, e] of this.crossSellingPromos[promosBlock].entries()) {
          if (i >= MAX_CROSS_SELLING_LIMIT) {
            break;
          }
          impressions.push({
            name: e.code,
            list,
            id: e.cart._up,
            category: e.category,
            brand: e.brandName,
            position: parseInt(i) + 1,
          });
          // TODO: fill in with IEcommerceTracking
          items.push({
            index: parseInt(i) + 1,
            item_brand: e._m_farmName?.en,
            currency: e.price?.currency?.crowdfarmer?.currency,
            price: e.price?.amount,
            item_variant: promosBlock === 'ohProjects' ? TrackingConstants.ITEM_VARIANT.OH : TrackingConstants.ITEM_VARIANT.ADOPT,
            quantity: 1,
            item_id: e.cart?._up,
            item_category: e.categoryName,
            item_category2: e.subcategoryName,
            item_category3: e._m_variety?.en,
            item_category4: e.subvariety,
            item_list_name: listName,
            item_name: e.code,
            // cart_number_items
            // product_id: e.code, product category id ?
            product_code: e.code,
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
        }

        this.trackingSrv.setInterimList(list);
        this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.IMPRESSION, true, { impressions });
        this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.VIEW_ITEM_LIST, true, { items });
      }
    }
  }

  private editProductName(project: any, index: number, csType: string): void {
    const products = [
      {
        picture: project.pictureURL,
        publicVariety: project._m_publicVariety[this.langSrv.getCurrentLang()],
      },
    ];

    this.popupSrv
      .open(CrosssellingNameComponent, {
        data: { products },
      })
      .onClose.subscribe((result) => {
        if (result) {
          const product = { ...project };
          const name = result[0].name;

          product.name = name;
          this.addToCart(product, index, csType);
        }
      });
  }

  /**
   * handler to check if we need name editor
   */
  public addToCartHandler(csType: string, index: number): void {
    const project = this.crossSellingPromos[csType][index];

    if (csType === 'adoptionProjects' && !(project.typeUpSell === 'UBER_UPS')) {
      this.editProductName(project, index, csType);
    } else {
      this.addToCart(project, index, csType);
    }
  }

  /**
   * tracking event and add to cart
   */
  private addToCart(project: any, index: number, csType: string): void {
    const isOneShot = project.sellingMethod === 'ONE_SHOT';
    const isMultiShot = !isOneShot;
    const isUberUp = project.typeUpSell === 'UBER_UPS';

    let cart;
    let totalInCart = 0;
    let stepLeft: number;

    if (project.upCf) {
      cart = this.cartSrv.get();
      stepLeft = project.upCf.stepMSReserved - project.upCf.stepMSUsed;

      if (cart) {
        cart.map((item: any) => {
          if (item._upCf === project.upCf._id) {
            totalInCart += item.numMasterBoxes;
          }
        });
      }
    }

    if (!project.upCf || totalInCart < stepLeft) {
      this.trackingSrv.trackEvent(
        TrackingConstants.GTM.EVENTS.ADD_TO_CART,
        true,
        {
          add: {
            products: [
              {
                name: project.code,
                id: project.cart._up.toString(),
                category: project._m_up[this.langSrv.getCurrentLang()],
                price: project.price.amount,
                brand: project.brandName,
                quantity: 1,
                variant: project.overharvest ? TrackingConstants.GTM.PARAMS.OVERHARVEST : TrackingConstants.GTM.PARAMS.ADOPT,
              },
            ],
          },
        },
        this.specifications.trackingActionName
      );

      this.cartsSrv.add(
        project.upCf ? 'multiShotBox' : project.overharvest ? 'overharvest' : 'adoption',
        {
          _id: project.cart._up,
          _m_up: project._m_up,
          _m_slug: project._m_upSlug,
        },
        project.name || project.upCf?.name || project.cart.uberUp?.name || null,
        project.upCf ? project.upCf : null,
        project.cart._masterBox,
        {
          numMasterBoxes: 1,
          mbLeft: stepLeft,
          stepMS: project.cart.stepMS,
        },
        project.typeUpSell === 'UBER_UPS' ? project.cart.uberUp : null,
        project.farmerSlug,
        { oneShot: isOneShot, multiShot: isMultiShot, uberUp: isUberUp }
      );

      this.trackGA4AddToCart(project, index, csType);
    }

    this.crossSellingProductAdded.emit();
  }

  private trackGA4AddToCart(project: UnknownObjectType, index: number, csType: string): void {
    if (!project) {
      return;
    }
    const PRODUCT_CODE = project.code;
    const items: IEcommerceTracking[] = [];
    const listName = this.specifications[csType]?.trackingGA4ListName;
    const position = index + 1;
    const farmName = project?._m_farmName?.en;

    items.push({
      index: position,
      item_brand: farmName,
      currency: project.price?.currency?.crowdfarmer?.currency,
      price: project.price?.amount,
      item_variant: project.overharvest ? TrackingConstants.ITEM_VARIANT.OH : TrackingConstants.ITEM_VARIANT.ADOPT,
      quantity: 1,
      item_id: project.cart?._up,
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
