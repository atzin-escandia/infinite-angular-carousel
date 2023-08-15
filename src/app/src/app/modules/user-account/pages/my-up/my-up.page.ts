import { Component, OnInit, Injector, Input, HostBinding } from '@angular/core';
import dayjs from 'dayjs';
import { BasePage } from '@app/pages';
import {
  UpService,
  SeasonsService,
  FarmerService,
  OrdersService,
  CalendarService,
  ProductService,
  AuthService,
  TrackingService,
  TrackingConstants,
} from '../../../../services';
import { PopoverService } from '@services/popover';
import { OrderAddressPopupComponent } from '@popups/order-address-popup';
import { ConfirmationPopupComponent } from '@popups/confirmation-popup';
import { PhotoVisorComponent } from '../../popups/photo-visor';
import { GenericPopupComponent } from '@popups/generic-popup';
import { StatusPopupComponent } from '@popups/status-popup';
import { AccordionGift } from '../../interfaces/order.interface';
import { INITIAL_ADOPTION_STATUS } from '@constants/adoption.constants';
import { IInitialAdoptionStatus } from '@modules/user-account/interfaces/adoption.interface';
import { IEcommerceTracking, UnknownObjectType } from '@app/interfaces';

@Component({
  selector: 'my-up',
  templateUrl: './my-up.html',
  styleUrls: ['./my-up.scss'],
})
export class MyUpPageComponent extends BasePage implements OnInit {
  @HostBinding('class') classes = 'nopl nopr';

  public upCf: any;
  public upCfId: string;
  public up: any;
  public order: any;
  public availableDates: any;
  public season: any;
  public billingSeason: any;
  public shippingSeason: any;
  public beforeEndShipping: any;
  public masterBoxes: any = [];
  public farmer: any;
  public farmerName: any;
  public link: any;
  public orders: any;
  private lastUpCfOrder: any;
  public status: IInitialAdoptionStatus;
  public nextSeason: any;
  public upSections: any = [this.textSrv.getText('Adoption'), this.textSrv.getText('Orders')];

  public tabsIds = ['Adoption', 'Orders'];
  public currentSection = 0;
  public harvestSection = true;
  public orderSection = false;

  public surveyOnDisplay = false;
  public dataAccordion: AccordionGift;
  public isGifter = false;

  @Input() public pagInput: any;
  @Input() public editCertOnDisplay: boolean;
  @Input() public documentationSection: HTMLElement;

  constructor(
    public injector: Injector,
    private upSrv: UpService,
    private farmerSrv: FarmerService,
    private calendarSrv: CalendarService,
    private seasonSrv: SeasonsService,
    private ordersSrv: OrdersService,
    public popoverSrv: PopoverService,
    public productSrv: ProductService,
    private authSrv: AuthService,
    private trackingSrv: TrackingService,
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    // TODO Make specific call
    // Get up params from url
    this.upCfId = this.getParam('upCfId');
    // Load user data and countries on base page
    const [upCf, orders] = await Promise.all([
      this.upSrv.getUpCf(this.upCfId),
      this.ordersSrv.getByUpCf(this.upCfId, 0),
      this.loadUser(),
      this.loadCountries(),
    ]);

    // Get UPCF
    this.upCf = upCf;
    // Get order of upcf
    this.orders = orders;

    const [up, farmer, season] = await Promise.all([
      this.upSrv.get(this.upCf._up),
      this.farmerSrv.getBySlug(this.upCf.farmerSlug),
      this.seasonSrv.get(this.upCf._season),
    ]);

    // Get up by id, farmer by slug, season
    this.up = up;
    // Ger order type
    this.orders.map((order: any) => this.productSrv.productType(order));
    // Checks current order delivery status if not cancelled
    this.ordersSrv.assingOrderStatus(this.orders);

    // Get farmer by slug
    this.farmer = farmer;
    this.farmerName = this.farmer.name + ' ' + this.farmer.surnames;
    // Get season
    this.season = season;
    // Get currentBillingSeason
    this.billingSeason = await this.seasonSrv.get(this.up._currentBillingSeason);

    this.link = 'farmer/' + this.farmer.slug + '/up/' + this.up.slug;

    // If there is next season, gets it
    if (this.season._nextSeason) {
      this.nextSeason = await this.seasonSrv.get(this.season._nextSeason);
    }

    this.up.masterBoxes = this.up.masterBoxes.filter((mb: any) => mb.adoptionActive);

    // Get masterBoxes
    for (const mb of this.up.masterBoxes) {
      const receivedMb = await this.upSrv.getMasterBox(mb._id);

      this.masterBoxes.push(receivedMb);
    }

    // Load countries on base page
    await this.loadCountries();

    // Gets the upCf orders (adoptions and renewals) and Sort them to get the last one
    const renewOrders = [];

    for (const order of this.orders) {
      if (order.orderType === 'MULTI_SHOT_RENEWAL' || order.orderType === 'ONE_SHOT_RENEWAL') {
        renewOrders.push(order);
      }
    }

    renewOrders.sort((a, b) => (a.registerDate < b.registerDate ? 1 : -1));

    this.lastUpCfOrder = renewOrders[0];

    const today = dayjs.utc();

    this.beforeEndShipping = dayjs.utc(this.season.shippingEndDate).diff(today, 'millisecond') > 0;
    // ? Today < MaxShipment
    const isBeforeMaxRenewDate = dayjs.utc(this.season.maxRenovationDate).diff(today, 'millisecond') >= 0;
    // ? Today < MaxRenovation

    this.initStatus();

    // After ShippingEndDate && next season Exits
    if (this.season.maxRenovationDate) {
      if (isBeforeMaxRenewDate) {
        // Today <= MaxRenew
        // Masterbox is available to send in any country of the crowdfarmer
        // renewAvailable
        const user = await this.userService.get();
        const masterBoxAvailable = await this.calendarSrv.masterBoxForCrowdfarmerAvailability(
          user._id.toString(),
          this.masterBoxes[0]._id.toString(),
          this.nextSeason._id.toString()
        );

        if (this.up.sellingMethod === 'ONE_SHOT') {
          if (masterBoxAvailable.available) {
            this.status.renewOpen = true;
          } else {
            this.status.renewNotOpen = true;
          }
        } else {
          this.status.renewOpen = masterBoxAvailable.available;
        }
      } else {
        // deadUp
        this.status.renovationClosed = true;
      }
    } else {
      this.manageNoMaxRenovationDate();
    }

    this.setStatusBySeason();
    await this.checkAdoptionIsLiberated();

    this.setLoading(false);
    this.setInnerLoader(false, false);

    this.upCf?.gift && this.setGiftAccordion();
  }

  public async checkAdoptionIsLiberated(): Promise<void> {
    this.status.adoptionLiberated = this.upCf.isOld;

    if (!this.status.adoptionLiberated) {
      const liberatable = await this.upSrv.canBeLiberated(this.upCf._id);

      this.status.cancelOpen = liberatable.result === 'ok';
    }
  }

  private setGiftAccordion(): void {
    if (this.upCf.gift._buyer !== this.authSrv.getCurrentUser()._id) {
      const { message } = this.upCf.gift.giftOptions;

      this.dataAccordion = {
        header: {
          gift: {
            isGifter: false,
          },
        },
        body: [
          {
            title: 'global.gifter.text-info',
            content: {
              info: this.upCf.gift.buyer?.name,
              extraInfo: this.upCf.gift.buyer?.email,
              italic: false,
            },
          },
          {
            title: 'page.personalized-email-message.form',
            content: {
              info: message,
              italic: true,
            },
          },
        ],
      };
    }
  }

  private manageNoMaxRenovationDate(): void {
    this.status.renewNotOpen = true;

    // Checks if the renovation was registered in the last 5 days or before
    if (this.lastUpCfOrder) {
      const fiveDaysAgo = new Date();

      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      if (new Date(this.lastUpCfOrder.registerDate) > fiveDaysAgo) {
        this.status.renewNotOpen = false;
      }
    }
  }

  private setStatusBySeason(): void {
    // Is on season if today is before shippingEndDate
    if (this.season) {
      this.status.onSeason = this.beforeEndShipping;
      this.status.outOfSeason = !this.status.onSeason;
      this.status.remainingUps = this.season.remainingUnits >= 1;
      this.status.adoptionsPurchaseClosed = dayjs().isAfter(new Date(this.season.purchaseEndDate));
    }
  }

  private initStatus(): void {
    this.status = Object.assign({}, INITIAL_ADOPTION_STATUS);
  }

  /**
   * Pagination function
   */
  public async paginate(e: any): Promise<any> {
    this.orders = await this.ordersSrv.getByUpCf(this.upCfId, e.start);
    // Ger order type
    this.orders.map((order: any) => this.productSrv.productType(order));
    // Checks current order delivery status if not cancelled
    this.ordersSrv.assingOrderStatus(this.orders);
  }

  /**
   * Change section
   */
  public changeSection(e: any): any {
    this.currentSection = e;
    this.harvestSection = false;
    this.orderSection = false;
    this.order = null;

    switch (e) {
      case 0:
        return (this.harvestSection = true);
      case 1:
        return (this.orderSection = true);
    }
  }

  /**
   * Minified card change section and go to order detail
   */
  public async minCardEvt(e: any): Promise<void> {
    this.setInnerLoader(true, false);
    this.changeSection(e.section);
    this.order = await this.ordersSrv.get(e.order, true);
    this.setInnerLoader(false, false);
  }

  /**
   * Opens photo historic
   */
  public openPhotosVisor(): void {
    if (this.upCf.pictureArchive && this.upCf.pictureArchive.length > 0) {
      this.popupSrv.open(PhotoVisorComponent, { data: { photos: this.upCf.pictureArchive } });
    } else {
      this.popupSrv.open(PhotoVisorComponent, { data: { photos: [{ url: this.upCf.pictureURL }] } });
    }
  }

  /**
   * Chaneg order address
   */
  public changeAddressInfo(): void {
    const changeAddressPopup = this.popupSrv.open(OrderAddressPopupComponent, {
      data: {
        order: this.order,
        user: this.user,
        countriesByIso: this.countriesByIso,
      },
    });

    changeAddressPopup.onClose.subscribe(async (result) => {
      if (result) {
        this.popupSrv.open(GenericPopupComponent, { data: { msg: this.textSrv.getText(result), id: 'change-address' } });
        this.order = await this.ordersSrv.get(this.order._id, true);
        this.domSrv.scrollToTop();
      }
    });
  }

  /**
   * Chande order dates
   */
  public changeDeliveryDate(): void {
    // Open calendar
    this.popoverSrv.open(
      'CalendarShipmentComponent',
      this.domSrv.getIsDeviceSize() ? 'order-overview-change-mob' : 'order-overview-change',
      {
        inputs: {
          order: this.order,
          availableDates: this.availableDates,
          customClass: 'order-detail-calendar',
          customBackground: 'opacity: 0.24; background-color: #1a1a1a; z-index: 600;',
          scroll: false,
          showX: true,
        },
        outputs: {
          save: async (date: any) => {
            try {
              const orderId = this.order._id;

              // Change to new date
              await this.ordersSrv.changeDate(orderId, date);
              // Refresh order info
              this.order = await this.ordersSrv.get(orderId, true);

              this.popupSrv.open(StatusPopupComponent, { data: { msgSuccess: 'Order delivery date change success' } });
            } catch (e) {
              this.popupSrv.open(StatusPopupComponent, { data: { err: true, msgError: e.msg } });
            }
          },
          onClose: () => {
            this.popoverSrv.close('CalendarShipmentComponent');
          },
        },
      }
    );
  }

  /**
   * Cancel order
   */
  public cancelOrder(): void {
    let popup = this.popupSrv.open(ConfirmationPopupComponent, {
      data: {
        title: 'page.cancel-order.button',
        msg: 'page.cancel-order.text-info',
        advise: 'page.refund-info.body',
        okAction: 'global.cancel-order.text-link',
        cancelAction: 'page.return.button',
      },
    });

    popup.onClose.subscribe(async (result) => {
      if (result) {
        try {
          this.setInnerLoader(true, true);

          await this.ordersSrv.cancelOrder(this.order._id);

          if (
            this.order.orderType === 'ONE_SHOT' ||
            this.order.orderType === 'MULTI_SHOT_ADOPTION' ||
            this.order.orderType === 'MULTI_SHOT_RENEWAL' ||
            this.order.orderType === 'ONE_SHOT_RENEWAL'
          ) {
            this.routerSrv.navigate('private-zone/my-order/info/' + this.order._id);
          } else {
            // Get UPCF
            this.upCf = await this.upSrv.getUpCf(this.upCfId);
            // Refresh order info
            this.order = await this.ordersSrv.get(this.order._id, true);
            // Refresh orders info
            this.orders = await this.ordersSrv.getByUpCf(this.upCfId, 0);
            // Ger order type
            this.orders.map((order: any) => this.productSrv.productType(order));
            // Checks current order delivery status if not cancelled
            this.ordersSrv.assingOrderStatus(this.orders);
          }

          this.trackGA4CancelOrder(this.order);

          this.setInnerLoader(false, true);

          popup = this.popupSrv.open(StatusPopupComponent, { data: { msgSuccess: 'cancel success' } });
        } catch (err) {
          this.setInnerLoader(false, true);

          this.popupSrv.open(StatusPopupComponent, {
            data: {
              err: true,
              msgError: this.textSrv.getText('Operation not available'),
            },
          });
        }
      }
    });
  }

  /**
   * Open receipt url in browser
   */
  public getReceipt(): void {
    // TODO: Universal fix needed
    if (this.domSrv.isPlatformBrowser()) {
      window.open(this.order.receiptURL);
    }
  }

  /**
   * Pass autoLogin validation
   */
  public autoLoginValidation(e: any): void {
    if (e.order) {
      this.order = e.order;
      this.availableDates = e.availableDates;
    }
    void this.checkLogin(() => this[e.funcName](e.id));
  }

  /**
   * Open incident process
   */
  public openIncident(): void {
    if (this.domSrv.isPlatformBrowser()) {
      window.open(this.env.domain + '/' + this.langSrv.getCurrentLang() + '/private-zone/open-issue/' + this.order._id, 'blank');
    }
  }

  /**
   * Show edit adoption certificate
   */
  public editCertEvtHandler(evt: boolean): void {
    this.editCertOnDisplay = evt;
  }

  /**
   * Close edit adoption certificate
   */
  public goToMyUpEvtHandler(evt: boolean): void {
    this.editCertOnDisplay = evt;
  }

  public getDocumentSectionEvtHandler(evt: any): void {
    this.documentationSection = evt;
  }

  /*
   * Liberate adoption
   */
  public liberateAdoption(): void {
    this.surveyOnDisplay = true;
    this.status.cancelOpen = false;
    this.domSrv.scrollTo('#liberate-adoption-survey');
  }

  public getCertData(evt: any): void {
    this.upCf.certURL = evt.url;
  }

  // TODO: fill in with IEcommerceTracking
  private trackGA4CancelOrder(order: UnknownObjectType): void {
    const items: IEcommerceTracking[] = [];
    const listName = this.trackingSrv.getInterimGA4List();
    const farmName = order?._m_farmName?.en;

    const RefundCustomData = {
      value: order?.amount?.totalToCollect,
      currency: order?.currency?.crowdfarmer?.currency,
      transaction_id: order?.paymentMethods?.crowdfarmer?.paymentRequest?.id?.id,
      payment_type: order?.paymentMethods?.crowdfarmer?.paymentRequest?.id?.payment_method_types[0],
      order_number: order?.orderNumber,
      // customer_type
    };

    items.push({
      index: this.trackingSrv.getPosition(),
      item_brand: farmName,
      currency: order?.currency?.crowdfarmer?.currency,
      price: order?.amount?.totalToCollect,
      item_variant: TrackingConstants.ITEM_VARIANT.ADOPT,
      quantity: order._m_name?.en?.length ? parseInt(order._m_name.en.charAt(0)) : 1,
      item_id: order?._up,
      item_category: order.up?._m_category?.en,
      item_category2: order.up?._m_subcategory?.en,
      item_category3: order.up?._m_variety?.en,
      item_category4: order.up?._m_subvariety?.en,
      item_list_name: listName,
      item_name: order.up?.code,
      // cart_number_items
      // product_id: e.code, product category id ?
      product_code: order.up?.code,
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

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.REFUND, true, { items }, RefundCustomData);
  }
}
