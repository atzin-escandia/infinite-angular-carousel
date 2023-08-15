import { Component, OnInit, Input, Injector } from '@angular/core';
import { BaseComponent } from '@app/components';
import { RouterService, CartsService, TrackingConstants, TrackingService, UpService, CalendarService, CountryService } from '@app/services';
import { PopupService } from '@services/popup';
import { PlanShipmentPopupComponent } from '../../popups/plan-shipment';

import dayjs from 'dayjs';
import { INITIAL_ADOPTION_STATUS } from '@constants/adoption.constants';
import { IInitialAdoptionStatus } from '@modules/user-account/interfaces/adoption.interface';
import { IEcommerceTracking } from '@app/interfaces';

@Component({
  selector: 'adoption-card',
  templateUrl: './adoption-card.component.html',
  styleUrls: ['./adoption-card.component.scss'],
})
export class AdoptionCardComponent extends BaseComponent implements OnInit {
  @Input() upCf: any;

  // Selling method
  public isOneShot = false;
  public isMultiShot = false;
  public isUberUp = false;

  public realUpCf: any;

  // Season
  public daysToEnd: number;
  public daysToRenew: number;
  public endSeason: any;
  public maxRenovationDate: any;

  public upType: number;
  public boxesReserved: string[] = [];
  public selectedMasterBox: any;

  // Status
  public status: IInitialAdoptionStatus = {
    ...INITIAL_ADOPTION_STATUS,
    onSeason: undefined,
    outOfSeason: undefined,
    renewOpen: undefined
  };

  // Order
  public orderRefunded = false;

  public productNotificationOpen = false;
  public isGift = false;

  constructor(
    public injector: Injector,
    public routerSrv: RouterService,
    public cartSrv: CartsService,
    public popupSrv: PopupService,
    public calendarSrv: CalendarService,
    private trackingSrv: TrackingService,
    private upSrv: UpService,
    private countrySrv: CountryService,
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    this.upType = +this.upCf.type;
    this.realUpCf = await this.upSrv.getUpCf(this.upCf.upCf);
    this.orderRefunded = this.upCf.isRefunded;
    this.isGift = this.realUpCf._gift;
    this.setBoxReserved();

    // Days to end of season and days to renew
    const currentDay = new Date();

    this.endSeason = new Date(this.upCf.shippingEndDate);
    const timeToEndOfSeason = this.endSeason.getTime() - currentDay.getTime();

    this.daysToEnd = timeToEndOfSeason < 0 ? 0 : Math.round((timeToEndOfSeason) / (1000 * 3600 * 24));
    if (this.upCf.maxRenovationDate) {
      this.maxRenovationDate = new Date(this.upCf.maxRenovationDate);
      const timeToRenovationDate = this.maxRenovationDate.getTime() - currentDay.getTime();

      this.daysToRenew = timeToRenovationDate < 0 ? 0 : Math.round((timeToRenovationDate) / (1000 * 3600 * 24));
    }

    // Make difference between one-shot and multi-shot
    if (this.upCf.up) {
      this.isOneShot = this.upCf.up.sellingMethod === 'ONE_SHOT';
      this.isMultiShot = !this.isOneShot;
      this.isUberUp = this.upCf.up.typeUpSell === 'UBER_UPS';

      // Select Masterbox
      this.selectedMasterBox = this.upCf.mbs.find(mb => mb.adoptionActive);
    }

    await this.initStatus();
  }

  private setBoxReserved(): void {
    const stepMSRefunded = this.realUpCf.stepMSRefunded || 0;
    let stepMSUsed = (this.realUpCf.stepMSUsed || 0) + stepMSRefunded;
    let stepMSLeft = (this.realUpCf.stepMSReserved || 0) - stepMSUsed;

    if (stepMSUsed < 0) {
      this.loggerSrv.error('stepMSUsed should be less than 0', {stepMSUsed, upCf: this.upCf._id});
      stepMSUsed = 0;
    }

    if (stepMSLeft < 0) {
      this.loggerSrv.error('stepMSLeft should be less than 0', {stepMSLeft, upCf: this.upCf._id});
      stepMSLeft = 0;
    }

    // Create array with boxes reserved using used and pending
    this.boxesReserved = [...Array(stepMSUsed).fill('used'), ...Array(stepMSLeft).fill('left')];
  }

  private async initStatus(): Promise<void> {
    // Check if adoption is liberated
    this.status.adoptionLiberated = this.upCf.isOld;
    this.status.adoptionsPurchaseClosed = dayjs().isAfter(new Date(this.upCf.purchaseEndDate));
    // if is before endshippingdate and there is a new season

    if (this.status.adoptionLiberated) {
      this.status.renovationClosed = true;
    } else if (this.daysToEnd > 0 && this.upCf._nextSeason) {
      const user = await this.userService.get();
      // Check if user have any address where mb is sent
      const masterBoxAvailable = await this.calendarSrv.masterBoxForCrowdfarmerAvailability(
        user._id.toString(),
        this.selectedMasterBox?._id,
        this.upCf._nextSeason
      );

      this.status.renewOpen = masterBoxAvailable.available;
    } else if (this.daysToEnd <= 0 && this.upCf.maxRenovationDate) {
      if (this.daysToRenew > 0) {
        await this.setStatusRenewOpenByUpSellingMethod();
      } else {
        // deadUp
        this.status.renovationClosed = true;
      }
    } else {
      this.status.renewNotOpen = true;
      // Checks if the renovation was registered in the last 5 days or before
      if (this.upCf.order?.registerDate) {
        const fiveDaysAgo = dayjs().subtract(5, 'days');
        const registerDate = dayjs(this.upCf.order.registerDate);

        if (registerDate.isBefore(fiveDaysAgo)) {
          this.status.renewNotOpen = false;
        }
      }
    }
    // check status renew open before the logic be applied. We need it to know if adoption is onSeason.
    this.status.onSeason = this.status.adoptionLiberated ? false : (this.daysToEnd > 0);
    // Is on season if today is before shippingEndDate
    this.status.outOfSeason = !this.status.onSeason;
  }

  private async setStatusRenewOpenByUpSellingMethod(): Promise<void> {
    // Today <= MaxRenew
    // renewAvailable
    // Check if user have any address where mb is sent
    const user = await this.userService.get();
    const masterBoxAvailable = await this.calendarSrv.masterBoxForCrowdfarmerAvailability(
      user._id.toString(),
      this.selectedMasterBox?._id,
      this.upCf._nextSeason
    );

    if (this.upCf.up.sellingMethod === 'ONE_SHOT') {
      this.status.renewOpen = this.upType === 0 ? masterBoxAvailable.available : true;
    } else {
      this.status.renewOpen = masterBoxAvailable.available;
    }
  }

  // Renew function
  public renew(): void {
    if (this.productNotificationOpen) {
      return;
    }

    // Add to tracking
    this.trackingSrv.trackEvent(
      TrackingConstants.GTM.EVENTS.ADD_TO_CART,
      true,
      {
        add: {
          products: [
            {
              name: this.upCf.up.code,
              id: this.upCf.up._id.toString(),
              category: this.upCf.up._m_up[this.langSrv.getCurrentLang()],
              price: 0,
              brand: this.upCf.farmerCompany,
              quantity: 1,
              variant: TrackingConstants.GTM.PARAMS.RENEW,
            },
          ],
        },
      },
      TrackingConstants.GTM.ACTIONS.RENEW
    );

    if (!this.isOneShot) {
      // if is multi shot
      const currentCart = this.cartSrv.get();

      currentCart?.map((product: any, i: number) => {
        if (product._upCf === this.upCf._id) {
          this.cartSrv.remove(i);
        }
      });

      const totalBoxes = Math.min(this.upCf.reserved, this.upCf.up.maxStepMS);

      this.addMultiShotToCartForRenewal(totalBoxes);
      this.routerSrv.navigateToOrderSection('cart');
    } else {
      this.addOneShotToCartForRenewal();
      this.upCf.productNotificationOpen = true;
      this.routerSrv.navigateToOrderSection('cart');
    }

    this.trackGA4AddToCart();
  }

  private addMultiShotToCartForRenewal(totalBoxes: number): void {
    this.cartSrv.add(
      'renewal',
      this.upCf.up,
      this.upCf.name,
      (this.upCf = {
        upSlug: this.upCf.upSlug,
        _up: this.upCf.up._id,
        farmerSlug: this.upCf.farmerSlug,
        name: this.upCf.name,
        _id: this.upCf._id,
        _uberUp: this.upCf._uberUp,
      }),
      this.selectedMasterBox?._id,
      // PRODUCT_MODEL
      {
        ...{stepMS: totalBoxes}, // TO-DO: Check syntaxis
      },
      null,
      null,
      {oneShot: this.isOneShot, multiShot: this.isMultiShot, uberUp: this.isUberUp}
    );
  }

  private addOneShotToCartForRenewal(): void {
    // If is one shot
    this.cartSrv.add(
      'renewal',
      this.upCf.up,
      this.upCf.name,
      (this.upCf = {
        upSlug: this.upCf.upSlug,
        _up: this.upCf.up._id,
        farmerSlug: this.upCf.farmerSlug,
        name: this.upCf.name,
        _id: this.upCf._id,
        _uberUp: this.upCf._uberUp,
      }),
      this.selectedMasterBox?._id,
      null,
      null,
      null,
      { oneShot: this.isOneShot, multiShot: this.isMultiShot, uberUp: this.isUberUp }
    );
  }

  /**
   * program new shipment
   */
  public planShipment(): void {
    if (!this.upCf.ticketOpened) {
      const planShipmentPopup = this.popupSrv.open(PlanShipmentPopupComponent, {
        data: {
          up: this.upCf.up,
          upCf: this.realUpCf,
          isFullHeight: true,
          close: true,
        },
      });

      planShipmentPopup.onClose.subscribe((res) => {
        if (res) {
          console.log(res);
        }
      });
    }
  }

  public isOneShotAdoptionActive(): boolean {
    return (
      this.isOneShot &&
      this.status.onSeason &&
      !(this.status.renewOpen && this.status.noRemainingBoxes) &&
      !this.orderRefunded &&
      !this.upCf.harvestBreak &&
      !this.upCf.areDeliveredAllBoxes
    );
  }

  public isMultiShotsAdoptionActive(): boolean {
    return (
      this.isMultiShot &&
      this.status.onSeason &&
      !(this.status.renewOpen && this.status.noRemainingBoxes) &&
      !this.orderRefunded &&
      !this.upCf.harvestBreak &&
      !this.upCf.areDeliveredAllBoxes
    );
  }

  private trackGA4AddToCart(): void {
    const items: IEcommerceTracking[] = [];
    const listName = this.trackingSrv.getInterimGA4List();
    const farmName = this.upCf?.farmerCompany; // this.up?._farm?._m_name?.en; // this.upSrv.get("adopta-un-arbol-de-mango-la-reala-kent");
    const countryCurrency = this.countrySrv.getCurrentCountry()?.currency;

    items.push({
      index: this.trackingSrv.getPosition(),
      item_brand: farmName,
      currency: countryCurrency,
      // price: this.price && this.price.shippingPerBox ? this.price.shippingPerBox * this.selBoxes : null,
      item_variant: TrackingConstants.ITEM_VARIANT.ADOPT,
      quantity: 1,
      item_id: this.upCf?.up?._id, // ask BE to provide this?
      item_category: this.upCf?.up?._m_category?.en, // ask BE to provide this?
      item_category2: this.upCf?.up?._m_subcategory?.en, // ask BE to provide this?
      item_category3: this.upCf?.up?._m_variety?.en, // ask BE to provide this?
      item_category4: this.upCf?.up?._m_subvariety?.en, // ask BE to provide this?
      item_list_name: listName, // ask BE to provide this?
      item_name: this.realUpCf?.code,
      // cart_number_items
      // product_id: e.code, product category id ?
      product_code: this.realUpCf?.code,
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

    this.trackingSrv.trackEventGA4( TrackingConstants.GTM4.EVENTS.ADD_TO_CART, true, { items });

  }
}
