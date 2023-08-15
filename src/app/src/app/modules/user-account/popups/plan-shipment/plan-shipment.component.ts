import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PopupsInterface } from '@popups/popups.interface';
import { PopupsRef } from '@popups/popups.ref';
import {
  CalendarService,
  CartsService,
  DomService,
  LangService,
  PricesService,
  RouterService,
  StorageService,
  TextService,
  TrackingConstants,
  TrackingService,
  UpService,
  UtilsService,
  LoggerService,
  CountryService
} from '@app/services';
import { PopoverService } from '@services/popover';
import { IEcommerceTracking, UnknownObjectType } from '@app/interfaces';

@Component({
  selector: 'plan-shipment-popup',
  templateUrl: './plan-shipment.component.html',
  styleUrls: ['./plan-shipment.component.scss']
})
export class PlanShipmentPopupComponent implements OnInit, AfterContentChecked {
  private location: string;

  public upCf: any;
  public up: any;

  public boxesReserved: string[] = [];
  public selBoxes: number;
  public storageSelBoxes: number;
  public minNumBoxes = 1;
  public maxNumBoxes = 1;
  public used = 0;
  public reserved = 0;
  public remainingBoxes: number;
  public calendarSelectorOpen: boolean;
  public productNotificationOpen = false;

  public storageKey: string;
  public storageData: any;
  public cartData: any;
  public cartItems: any[] = [];
  public totalCart = 0;

  public masterBoxes = [];

  public product: any = {
    type: 'MULTI_SHOT_SINGLE_BOXES',
    masterBox: null,
    up: null,
    availableDates: [],
    selectedDates: [],
    shippingDates: []
  };

  public datesItem: any = {
    type: 'MULTI_SHOT_SINGLE_BOXES',
    up: null,
    upCf: null,
    masterBox: null
  };

  public onClose: any;
  public isFullHeight: boolean;

  public planShipmentContainer: any;
  public planShipmentItems: any;
  private price: UnknownObjectType;

  constructor(
    public config: PopupsInterface, public popup: PopupsRef,
    private cdr: ChangeDetectorRef, public popoverSrv: PopoverService,
    public textSrv: TextService, public domSrv: DomService,
    public calendarSrv: CalendarService, private storageSrv: StorageService,
    public utilsSrv: UtilsService, public cartSrv: CartsService,
    public routerSrv: RouterService, public trackingSrv: TrackingService,
    public langSrv: LangService, public priceSrv: PricesService,
    private upSrv: UpService,
    private loggerSrv: LoggerService,
    private countrySrv: CountryService
    ) {
  }

  // Need to prevent error
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }

  async ngOnInit(): Promise<any> {
    this.up = this.config.data.up;
    this.upCf = this.config.data.upCf;

    await this.getAdoptionActiveMB();

    // Set storage Key
    this.storageKey = 'productPlanHarvest-' + this.up._id;
    // Set storage recovered data
    this.storageData = this.storageSrv.get(this.storageKey);
    // Get cart data
    this.cartData = this.cartSrv.get();
    // Get location to get available dates
    this.location = this.storageSrv.get('location');
    this.product.masterBox = this.up._masterBoxes[0];
    // Check cart products
    if (this.cartData) {
      this.totalCart = 0;

      for (const item of this.cartData) {
        if (item._upCf && item._upCf === this.upCf._id && item.type === 'MULTI_SHOT_SINGLE_BOXES') {
          this.totalCart += item.numMasterBoxes;
          this.cartItems.push(item);
        }
      }
    }

    // Set product object
    this.product.masterBox = this.up._masterBoxes[0];
    this.product.up = this.up;

    // Set dates Object
    this.datesItem.up = this.up._id;
    this.datesItem.masterBox = this.up._masterBoxes[0];
    this.datesItem.upCf = this.upCf._id;

    this.reserved = this.upCf.stepMSReserved ?? this.upCf.reserved;
    this.used = (this.upCf.stepMSUsed ?? this.upCf.used) + (this.upCf.stepMSRefunded ?? 0);
    this.maxNumBoxes = this.reserved;
    this.remainingBoxes = this.reserved - this.used;
    if (this.remainingBoxes < 0){
      this.remainingBoxes = 0;
      this.loggerSrv.error('remainingBoxes should be more than 0', {remainingBoxes: this.remainingBoxes, upCf : this.upCf._id });
    }

    // Get available dates for this project
    await this.getDates();

    // Set data for component
    if (!this.storageData && this.cartItems.length === 0) {
      // Clean init
      this.selBoxes = this.minNumBoxes;

      this.product.shippingDates = [
        {
          remainingBoxes: this.remainingBoxes,
          selectedBoxes: this.minNumBoxes,
          date: this.product.availableDates[0]
        }
      ];
    } else if (this.cartItems?.length > 0 && !this.storageData) {
      this.initFromCart();
    } else {
      // Init from previous popup
      this.product.shippingDates = this.storageData.shippingDates;
      // Remove date if selectedBoxes is 0
      this.product.shippingDates = this.product.shippingDates.filter(item => item.selectedBoxes > 0);

      // If data recovered just allow real boxes
      this.storageSelBoxes = this.storageData.shippingDates.reduce((prev, cur) => prev + cur.selectedBoxes, 0);
      this.selBoxes = this.storageSelBoxes > 0 ? this.storageSelBoxes : this.minNumBoxes;
    }

    if (this.product.availableDates?.length) {
      // Remove available date if has been set as shipping date
      this.product.availableDates = this.product.availableDates.filter((date: string) => {
        const shippingDates = this.product.shippingDates.map((shippingDate: any) => shippingDate.date);

        if (!shippingDates.includes(date)) {
          return date;
        }
      });
    }

    // Create array with boxes reserved, selected and left
    this.setVisualBoxes();

    setTimeout(() => {
      // Set all visual steps
      this.planShipmentItems = this.domSrv.getAllElements('.plan-shipment-body-item');

      if (this.planShipmentItems?.length) {
        for (const element of this.planShipmentItems) {
          element.classList.remove('closed');
        }
      }

      this.planShipmentContainer = this.domSrv.getElement('#dates-container');
    }, 0);
  }

  private initFromCart(): void {
    // Init from cart
    if (this.totalCart) {
      this.selBoxes = this.totalCart;
      const acc = this.remainingBoxes - this.cartItems
          .map(item => item.numMasterBoxes)
          .reduce((accumulator, currentValue) => accumulator + currentValue)
        + this.minNumBoxes;

      for (const item of this.cartItems) {
        this.product.shippingDates.push({
          remainingBoxes: acc,
          selectedBoxes: item.numMasterBoxes,
          date: item.selectedDate
        });
      }
    }
  }

  private async getAdoptionActiveMB(): Promise<void> {
    const adoptionActiveMB = [];

    for (const mb of this.up._masterBoxes) {
      const receivedMb = await this.upSrv.getMasterBox(mb);

      if (receivedMb.adoptionActive) {
        adoptionActiveMB.push(mb);
      }
    }

    this.up._masterBoxes = [...adoptionActiveMB];

    if (this.up.masterBoxes) {
      this.up.masterBoxes = this.up.masterBoxes.filter((mb: any) => mb.adoptionActive);
    }
  }

  private getSelectedMasterBox(): string {
    return this.up.selectedMasterBox?._id ||
      (this.up.masterBoxes?.length ? this.up.masterBoxes[0]._id : this.up._masterBoxes[0]);
  }

  private setVisualBoxes(): void {
    const remaining = Math.ceil(this.maxNumBoxes) - (Math.ceil(this.used) + Math.ceil(this.selBoxes)) || 0;

    this.boxesReserved = [];
    this.boxesReserved = this.boxesReserved.concat(
      Array(Math.ceil(this.used)).fill('used'),
      Array(Math.ceil(this.selBoxes)).fill('selected'),
      Array(remaining).fill('left')
    );
  }

  // Get dates
  private async getDates(): Promise<void> {
    try {
      const dates = await this.calendarSrv.availableDatesRaw(this.location, this.datesItem);

      this.product.availableDates = dates.availableDates;
    } catch (e) {
      this.product.availableDates = null;
    }
  }

  /**
   * Change and updates ums value, then recalcultes price
   *
   * @param step 1 | -1
   */
  public addSubstractUms(step: number, item: any): void {
    this.product.shippingDates[item].selectedBoxes += step;
    this.selBoxes += step;

    for (const date of this.product.shippingDates) {
      if (step < 0) {
        date.remainingBoxes = date.remainingBoxes + 1;
      } else {
        date.remainingBoxes = date.remainingBoxes - 1;
      }
    }

    // remove item if selBoxes is less than 0
    if (this.product.shippingDates.length > 1 && this.product.shippingDates[item].selectedBoxes <= 0) {
      // add date to available dates array and sort it again
      this.product.availableDates.push(this.product.shippingDates[item].date);

      this.planShipmentItems = this.domSrv.getAllElements('.plan-shipment-body-item');
      this.planShipmentItems[item].classList.add('closed');

      setTimeout(() => {
        this.product.shippingDates.splice(item, 1);

        if (!this.cartItems || this.cartItems.length === 0) {
          this.storageSrv.set('productPlanHarvest-' + this.product.up._id, this.product);
        }
      }, 200);
    }

    // Update array with boxes selected
    this.setVisualBoxes();

    if (!this.cartItems || this.cartItems.length === 0) {
      this.storageSrv.set('productPlanHarvest-' + this.product.up._id, this.product);
    }
  }

  /**
   * Add shipping date
   */
  public addShippingDate(): void {
    this.selBoxes = this.selBoxes + this.minNumBoxes;

    this.product.shippingDates.map((date) => {
      date.remainingBoxes -= this.minNumBoxes;
    });

    const availableClone = this.product.availableDates.filter(date => {
      const shippingDates = this.product.shippingDates.map(shippingDate => shippingDate.date);

      if (!shippingDates.includes(date)) {
        return date;
      }
    });

    this.product.shippingDates.push({
      remainingBoxes: this.remainingBoxes - this.selBoxes + this.minNumBoxes,
      selectedBoxes: 1,
      date: availableClone[0]
    });

    // Update array with boxes selected
    this.setVisualBoxes();

    // Scroll to bottom of container
    setTimeout(() => {
      this.planShipmentItems = this.domSrv.getAllElements('.plan-shipment-body-item');
      const containerHeight = (this.planShipmentItems[0].clientHeight * (this.planShipmentItems.length + 1)) + 50;

      this.planShipmentContainer.scrollTop = containerHeight;
      this.planShipmentItems[this.planShipmentItems.length - 1].classList.remove('closed');
    }, 0);

    // Avoid repeating dates
    availableClone.splice(availableClone[0], 1);
    this.product.availableDates = availableClone;

    // Save info
    if (!this.cartItems || this.cartItems.length === 0) {
      this.storageSrv.set('productPlanHarvest-' + this.product.up._id, this.product);
    }
  }

  /**
   * Open Select Dates Popup
   */
  public openSelectDatesPopup(index: number): void {
    this.product.availableDates = this.product.availableDates.filter(date => {
      const shippingDates = this.product.shippingDates.map(shippingDate => shippingDate.date);

      if (!shippingDates.includes(date)) {
        return date;
      }
    });
    this.product.availableDates.sort();

    this.popoverSrv.open('CalendarShipmentComponent', 'plan-shipment-popup', {
      inputs: {
        product: this.product,
      },
      outputs: {
        save: (date: any) => {
          // add date to selected dates
          this.product.selectedDates.push(date);
          const oldDate = this.product.shippingDates[index].date;

          this.product.shippingDates[index].date = date;

          // remove date from available dates
          if (this.product.availableDates.indexOf(date) > -1) {
            this.product.availableDates.splice(this.product.availableDates.indexOf(date), 1);
            this.product.availableDates.push(oldDate);
          }
        },
        onClose: () => {
          this.popoverSrv.close('CalendarShipmentComponent');
          this.calendarSelectorOpen = false;

          if (!this.cartItems || this.cartItems.length === 0) {
            this.storageSrv.set('productPlanHarvest-' + this.product.up._id, this.product);
          }
        }
      }
    });
  }

  /**
   * Add to cart
   */
  public async addToCart(e: any): Promise<void> {
    const isOneShot = this.up.sellingMethod === 'ONE_SHOT';
    const isMultiShot = !isOneShot;
    const isUberUp = this.up.typeUpSell === 'UBER_UPS';
    const mbLeft = this.reserved - this.used;

    e.preventDefault();

    this.up.selectedMasterBox = {
      _id: this.getSelectedMasterBox()
    };

    try {
      this.price = await this.priceSrv.get(this.up, this.location, 'MULTI_SHOT_ADOPTION', this.selBoxes, this.upCf._id);
    } catch (error) {
      // Just catch
    }

    if (this.productNotificationOpen) {
      return;
    }

    if (this.cartData && this.cartData.length > 0) {
      this.cartData = this.cartData.filter(item => {
        if (!item._upCf || item._upCf !== this.upCf._id || item.type !== 'MULTI_SHOT_SINGLE_BOXES') {
          return item;
        }
      });

      this.cartSrv.update(this.cartData);
    }

    for (const i in this.product.shippingDates) {
      if (this.product.shippingDates[i]) {
        // Add to cart service
        this.cartSrv.add(
          'multiShotBox',
          this.up,
          this.upCf.name,
          this.upCf,
          this.getSelectedMasterBox(),
          {
            ...({
              numMasterBoxes: this.product.shippingDates[i].selectedBoxes,
              mbLeft
            }),
          },
          isUberUp ? this.upCf.uberUp : null,
          null,
          {
            oneShot: isOneShot,
            multiShot: isMultiShot,
            uberUp: isUberUp
          },
          this.product.shippingDates[i].date
        );
      }
    }

    this.productNotificationOpen = true;

    this.up.masterBox = this.up._masterBoxes[0];
    this.trackGA4AddToCart();

    this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.ADD_TO_CART, true, {
      add: {
        products: [{
          name: this.up.code,
          id: this.up._id.toString(),
          category: this.up._m_up[this.langSrv.getCurrentLang()],
          price: this.price && this.price.shippingPerBox ? this.price.shippingPerBox * this.selBoxes : null,
          quantity: this.selBoxes,
          variant: TrackingConstants.GTM.PARAMS.ADOPT
        }]
      }
    }, TrackingConstants.GTM.ACTIONS.PLAN_ALL);

    this.onClose();

    // Delete storage info
    this.storageSrv.clear(this.storageKey);

    setTimeout(() => this.routerSrv.navigateToOrderSection('cart'), 300);
  }

  private trackGA4AddToCart(): void {
    const PRODUCT_CODE = this.up?.code;
    const items: IEcommerceTracking[] = [];
    const listName = 'Private_Zone/Adoptions';
    const farmName = this.up?._farm; // this.up?._farm?._m_name?.en; // this.upSrv.get("adopta-un-arbol-de-mango-la-reala-kent");
    const countryCurrency = this.countrySrv.getCurrentCountry()?.currency;

    items.push({
      index: this.trackingSrv.getPosition(),
      item_brand: farmName,
      currency: countryCurrency,
      price: this.price && this.price.shippingPerBox ? this.price.shippingPerBox * this.selBoxes : null,
      item_variant: TrackingConstants.ITEM_VARIANT.ADOPT,
      quantity: this.selBoxes,
      item_id: this.up?._id,
      item_category: this.up?._m_category?.en, // ask BE to provide this?
      item_category2: this.up?._m_subcategory?.en, // ask BE to provide this?
      item_category3: this.up?._m_variety?.en, // ask BE to provide this?
      item_category4: this.up?._m_subvariety?.en, // ask BE to provide this?
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
