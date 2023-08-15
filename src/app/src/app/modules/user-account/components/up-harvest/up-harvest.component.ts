import { Component, ElementRef, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import dayjs from 'dayjs';
import { BaseComponent } from '@app/components';
import {
  CartsService,
  CountryService,
  EventService,
  PricesService,
  RouterService,
  TrackingConstants,
  TrackingService,
  UpService,
  UtilsService,
} from '@app/services';
import { StatusPopupComponent } from '@popups/status-popup';
import { PlanShipmentPopupComponent } from '../../popups/plan-shipment';
import { LiberateAdoptionConfirmationPopupComponent } from '../../popups/liberate-adoption-confirmation-popup';
import { LiberateAdoptionInformativePopupComponent } from '../../popups/liberate-adoption-informative-popup';
import { ORDER_TICKET_STATUS, ORDER_TYPE } from '@constants/order.constants';
import { AccordionGift } from '@modules/user-account/interfaces/order.interface';

@Component({
  selector: 'up-harvest',
  templateUrl: './up-harvest.component.html',
  styleUrls: ['./up-harvest.component.scss'],
})
export class UpHarvestComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() public up: any;
  @Input() public upCf: any;
  @Input() public season: any;
  @Input() public status: any;
  @Input() public masterBoxes: any;
  @Input() public currentBillingSeason: any;
  @Input() public beforeEndShipping: any;
  @Input() public farmerName: any;
  @Input() public farmerCompany: any;
  @Input() public orders: any;
  @Input() public link: any;
  @Input() public id: any;
  @Input() public user: any;
  @Input() public app: any;
  @Input() public certData: any;
  @Input() public dataAccordion: AccordionGift;

  @Output() minCardEvt: EventEmitter<any> = new EventEmitter<any>();
  @Output() editCertEvt: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() liberateAdoption: EventEmitter<any> = new EventEmitter<any>();
  @Output() getDocumentSectionEvt: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('documentationSection') public documentationSection: ElementRef;

  public isOneShot = false;
  public isMultiShot = false;
  public isUberUp = false;
  public isOldGarden = false;
  public isOld = false;
  public ticketOpened = false;
  public showAutoRenewalSwitch = false;

  public products: any;
  public productNotificationOpen = false;
  public max: number;
  public min: number;
  public masterBoxLeft: number;
  public masterBoxUsed: number;
  public masterBoxReserved: number;
  public masterBoxReservedColl: any;
  public masterBoxesNames: any;

  public endSeason: any;
  public currentDay: any;
  public daysToEnd: number;
  public maxRenovationDate: any;
  public daysToRenew: number;
  public orderRefunded: boolean;

  public isCalculateCostsActive = false;
  public autoRenewActive = false;
  public calculateCostsData: any;
  public numberOfBoxes: number;
  public boxPrices: boolean;
  public price: any;

  public countriesArraySelect: any;
  public countriesByIso: any = {};
  public availableCountriesByISO: any = [];
  public country: any;

  public editCertOnDisplay = false;

  constructor(
    public injector: Injector,
    public routerSrv: RouterService,
    private countrySrv: CountryService,
    private cartSrv: CartsService,
    public priceSrv: PricesService,
    private eventSrv: EventService,
    private upSrv: UpService,
    public utilsSrv: UtilsService,
    private trackingSrv: TrackingService
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    // Make difference between one-shot and multi-shot
    if (this.up) {
      this.isOneShot = this.up.sellingMethod === 'ONE_SHOT';
      this.isMultiShot = !this.isOneShot;
      this.isUberUp = this.up.typeUpSell === 'UBER_UPS';
    }

    // Works out the number of boxes used and available
    if (this.upCf) {
      // PRODUCT_MODEL
      const stepMSRefunded = this.upCf.stepMSRefunded || 0;

      this.masterBoxLeft = this.upCf.stepMSReserved
        ? this.upCf.stepMSReserved - this.upCf.stepMSUsed - stepMSRefunded
        : (this.upCf.umsReserved - this.upCf.umsUsed) / this.up.masterUnitsStep;
      this.checkMasterBoxLeft();

      this.masterBoxUsed = (this.upCf.stepMSUsed ?? this.upCf.umsUsed / this.up.masterUnitsStep) + stepMSRefunded;
      this.masterBoxReserved = this.upCf.stepMSReserved || this.upCf.umsReserved / this.up.masterUnitsStep;
      this.masterBoxReservedColl =
        this.masterBoxUsed || (this.masterBoxUsed === 0 && this.masterBoxLeft) || this.masterBoxLeft === 0
          ? Array(Math.ceil(this.masterBoxUsed))
              .fill('used')
              .concat(Array(Math.ceil(this.masterBoxLeft)).fill('left'))
          : [];

      // Check adoption/renewal order to check if ticket is opened to not to allow to plan shipment
      this.checkTicketOpen();

      // autoRenewCheck
      this.autoRenewActive = !!this.upCf.autoRenew;
    }

    // Select Masterbox
    this.initSelectedMasterBox();

    // Get MasterBoxesNames
    if (this.up.masterBoxes) {
      this.setMasterBoxesNames();
      this.langSrv.getCurrent().subscribe((lang): void => {
        this.masterBoxesNames = null;
        setTimeout(() => {
          this.masterBoxesNames = this.detectLangChange(lang);
        }, 0);
      });
    }

    // Load Country data
    await this.loadCountryData();

    this.min = this.up.minStepMS;
    this.max = this.up.maxStepMS;
    this.setNumberOfBoxes();

    await this.calculatePrice();

    // How many days until end of season
    if (this.season) {
      const today = dayjs(new Date());

      this.endSeason = new Date(this.season.shippingEndDate);
      this.currentDay = new Date();
      this.daysToEnd = dayjs(this.endSeason).diff(today, 'day');
      this.upCf && (this.isOldGarden = this.upCf.isOld || this.upCf.isDead);

      if (this.season.maxRenovationDate) {
        this.maxRenovationDate = new Date(this.season.maxRenovationDate);
        const limitDate = dayjs(this.maxRenovationDate);

        this.setDaysToRenew(limitDate, today);
        !this.isOldGarden && (this.isOldGarden = dayjs().isAfter(this.maxRenovationDate));
      }
    }

    // Get products
    // In one shot the crowd-farmer could have chosen different mb, so we check most recent order products instead
    // In renewal case we show a mb selector, so we show the products of the first mb
    const masterBoxIndex = this.upCf._masterBox ? this.masterBoxes.findIndex((elem) => elem._id === this.upCf._masterBox) : 0;

    this.initProducts(masterBoxIndex);
    this.showAutoRenewalSwitch = !this.isOldGarden && this.adoptionPostAutoRenewalIntegration();
    this.setProductsQuantity(masterBoxIndex);
    this.getDocumentSection();
    this.orderRefunded = this.upCf.isRefunded;
  }

  private setDaysToRenew(limitDate: dayjs.Dayjs, today: dayjs.Dayjs): void {
    const isMaxRenovationDateGreaterThanToday = this.maxRenovationDate.getTime() - this.currentDay.getTime() > 0;

    this.daysToRenew = isMaxRenovationDateGreaterThanToday ? limitDate.diff(today, 'day') : null;
  }

  private setNumberOfBoxes(): void {
    this.numberOfBoxes =
      this.masterBoxReserved && this.masterBoxReserved <= this.max && this.masterBoxReserved >= this.min
        ? this.masterBoxReserved
        : this.max;
  }

  private setMasterBoxesNames(): void {
    this.masterBoxesNames = this.up.masterBoxes.map(
      // TODO: create mb type
      (mb) => {
        const publicName = mb._m_publicName[this.langSrv.getCurrentLang()] || mb._m_publicName.en;

        return String(publicName.charAt(0).toUpperCase()) + String(publicName.slice(1));
      }
    );
  }

  private setProductsQuantity(masterBoxIndex): void {
    this.up.masterBoxes[masterBoxIndex].products.map((product: any, i: number) => {
      if (this.products[i]._id === product._productId) {
        return (this.products[i].quantity = product.quantity);
      }
    });
  }

  private initProducts(masterBoxIndex: number): void {
    this.products =
      this.isOneShot && !(this.status.outOfSeason && this.status.renewOpen)
        ? this.orders[0].products
        : this.up?.masterBoxes[masterBoxIndex]?.products || [];
  }

  private initSelectedMasterBox(): void {
    this.up.selectedMasterBox = this.masterBoxes.find((elem) => elem._id === this.upCf?._masterBox) || this.masterBoxes[0];
    const link = this.domSrv.getAllElements('.farmerLink');

    if (link.length) {
      Array.from(link).map((elm: any) => {
        elm.addEventListener('click', (e: any) => {
          e.preventDefault();
          this.routerSrv.navigate(this.link);
        });
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.certData && changes.certData.currentValue) {
      this.upCf.certURL = changes.certData.currentValue.url;
    }
  }

  private detectLangChange(lang?): string[] {
    return this.up.masterBoxes.map((mb) => mb._m_publicName[lang ? lang : this.langSrv.getCurrentLang()]);
  }

  /**
   * Open season calculator
   */
  public openSeasonSimulator(): void {
    this.isCalculateCostsActive = !this.isCalculateCostsActive;

    this.calculateCostsData = {
      countriesByIso: this.availableCountriesByISO,
      up: this.up,
      masterBoxReserved: this.masterBoxReserved,
      boxPrices: this.price,
      status: this.status,
    };

    if (this.upCf) {
      this.calculateCostsData.upCf = this.upCf;
      this.calculateCostsData.country = this.upCf.country;
    } else {
      this.calculateCostsData.country = this.availableCountriesByISO[0];
    }
  }

  /**
   * program new shipment
   */
  public planShipment(): void {
    this.popupSrv.open(PlanShipmentPopupComponent, {
      data: {
        up: this.up,
        upCf: this.upCf,
        isFullHeight: true,
        close: true,
      },
    });
  }

  /**
   * Renew
   */
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
              name: this.up.code,
              id: this.up._id.toString(),
              category: this.up._m_up[this.langSrv.getCurrentLang()],
              price: this.price.amount,
              brand: this.farmerCompany,
              quantity: this.numberOfBoxes,
              variant: TrackingConstants.GTM.PARAMS.RENEW,
            },
          ],
        },
      },
      TrackingConstants.GTM.ACTIONS.RENEW_DETAILS
    );

    if (!this.isOneShot) {
      const currentCart = this.cartSrv.get();

      if (currentCart) {
        currentCart.map((product: any, i: number) => {
          if (product._upCf === this.upCf._id) {
            this.cartSrv.remove(i);
          }
        });
      }

      const totalBoxes = this.numberOfBoxes;

      this.cartSrv.add(
        'renewal',
        this.up,
        this.upCf.name,
        this.upCf,
        this.up.selectedMasterBox._id,
        // PRODUCT_MODEL
        {
          ...{ stepMS: totalBoxes },
        },
        null,
        null,
        { oneShot: this.isOneShot, multiShot: this.isMultiShot, uberUp: this.isUberUp }
      );

      this.routerSrv.navigateToOrderSection('cart');
    } else {
      this.cartSrv.add('renewal', this.up, this.upCf.name, this.upCf, this.up.selectedMasterBox._id, null, null, null, {
        oneShot: this.isOneShot,
        multiShot: this.isMultiShot,
        uberUp: this.isUberUp,
      });

      this.productNotificationOpen = true;
      this.up.masterBox = this.up.masterBoxes.find((mb) => mb._id === this.up.selectedMasterBox._id);

      this.routerSrv.navigateToOrderSection('cart');
    }
  }
  // Check if an order have ticket opened in current season
  private checkTicketOpen(): void {
    const seasonLastRenewal = [];

    if (this.orders?.length > 0) {
      for (const order of this.orders) {
        const { orderType, orderTicketStatus, _season } = order;

        if (orderType === ORDER_TYPE.ORDER_MULTI_SHOT_ADOPTION_RENEWAL) {
          seasonLastRenewal.push(_season);
        }
        if (
          orderType &&
          [ORDER_TYPE.ORDER_MULTI_SHOT_ADOPTION, ORDER_TYPE.ORDER_MULTI_SHOT_ADOPTION_RENEWAL].includes(orderType) &&
          orderTicketStatus === ORDER_TICKET_STATUS.ORDER_TICKET_OPENED
        ) {
          this.ticketOpened = _season === seasonLastRenewal[0];
        }
      }
    }
  }

  /**
   * Change and updates ums value, then recalcultes price
   *
   * @param step 1 | -1
   */
  public addSubsctract(step: number): void {
    this.numberOfBoxes = this.numberOfBoxes + step;
    void this.calculatePrice();
  }

  /**
   * loads profile and opens it in new window
   */
  public async loadProfile(): Promise<void> {
    this.eventSrv.dispatchEvent('loading-animation', { set: true });
    if (this.domSrv.isPlatformBrowser()) {
      let url;

      if (this.upCf.profileURL) {
        url = this.upCf.profileURL;
      } else {
        try {
          const profile = await this.upSrv.getUpCfProfile(this.upCf._id);

          url = profile.url;
        } catch (e) {
          this.eventSrv.dispatchEvent('loading-animation', { set: false });
          this.popupSrv.open(StatusPopupComponent, {
            data: {
              err: true,
              msgError: 'We have trouble generating your certificate now.<br><br>Please try it later',
            },
          });
        }
      }

      this.app ? window.open(url, '_self') : window.open(url);
    }
    this.eventSrv.dispatchEvent('loading-animation', { set: false });
  }

  /**
   * loads certificate and opens it in new window
   */
  public async loadCert(): Promise<void> {
    this.eventSrv.dispatchEvent('loading-animation', { set: true });

    if (this.domSrv.isPlatformBrowser()) {
      let url;

      if (this.upCf.certURL) {
        url = this.upCf.certURL;
      } else {
        try {
          const cert = await this.upSrv.getUpCfCert(this.upCf._id);

          url = cert.url;
        } catch (e) {
          this.eventSrv.dispatchEvent('loading-animation', { set: false });

          return this.popupSrv.open(StatusPopupComponent, {
            data: {
              err: true,
              msgError: 'We have trouble generating your certificate now.<br><br>Please try it later',
            },
          });
        }
      }

      this.app ? window.open(url, '_self') : window.open(url);
    }

    this.eventSrv.dispatchEvent('loading-animation', { set: false });
  }

  /**
   * Gets the index of the order to be updated
   */
  public detailInUp(i: number): void {
    this.minCardEvt.emit({ section: 1, order: this.orders[i]._id });
  }

  /**
   * Calculate Price
   */
  private async calculatePrice(country?: any): Promise<void> {
    this.price = await this.priceSrv
      .get(
        this.up,
        country || this.upCf.country || this.availableCountriesByISO[0],
        this.isOneShot ? 'ONE_SHOT_RENEWAL' : 'MULTI_SHOT_RENEWAL',
        this.numberOfBoxes
      )
      .catch((err) => {
        this.loggerSrv.error(err);
      });
  }

  /**
   * Loads country data
   */
  private async loadCountryData(): Promise<void> {
    this.country = this.countrySrv.getCountry();
    this.countriesByIso = await this.countrySrv.getCountriesByISO();

    // Available countries
    this.up.selectedMasterBox.countries.map(({ iso }) => {
      this.availableCountriesByISO.push(this.countriesByIso[iso]);
    });

    // Sort
    this.availableCountriesByISO = this.availableCountriesByISO.sort((a: any, b: any) => {
      if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1;
      }
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      }

      return 0;
    });
  }

  private adoptionPostAutoRenewalIntegration(): boolean {
    /* The date where it was uploaded the development that allows autorenewal */
    const autoRenewIntegrationDate = '2021-11-02T08:37:45.810+0000';

    return this.orders.some(
      (order) =>
        ['MULTI_SHOT_ADOPTION', 'ONE_SHOT', 'MULTI_SHOT_RENEWAL', 'ONE_SHOT_RENEWAL'].includes(order.orderType) &&
        dayjs(order.createdAt).isAfter(dayjs(autoRenewIntegrationDate))
    );
  }

  public async changeCountry(country: string): Promise<void> {
    this.countrySrv.setCountry(country);
    await this.calculatePrice(country);
  }
  /**
   * Select Masterbox
   */
  public selectMasterbox(mbn = 0): void {
    this.up.selectedMasterBox = this.up ? this.masterBoxes[this.masterBoxesNames.indexOf(mbn)] : null;
    this.products = this.up ? this.up.masterBoxes[this.masterBoxesNames.indexOf(mbn)].products : [];
    void this.calculatePrice();
  }

  /**
   * Open edit certificate
   */
  public editCert(): void {
    this.editCertOnDisplay = true;
    this.editCertEvt.emit(this.editCertOnDisplay);
    this.domSrv.scrollTo('#my-up-title');
  }

  public getDocumentSection(): void {
    this.getDocumentSectionEvt.emit(this.documentationSection);
  }

  public async autoLoginValidation(funcName: string, args?: any[]): Promise<void> {
    const callBack = (): void => {
      if (args) {
        this[funcName](...args);
      } else {
        this[funcName]();
      }
    };

    await this.compCheckLogin(this.user.email, callBack);
  }

  /**
   * Liberate adoption renewal pop-up
   */
  async liberateAdoptionRenewal(): Promise<void> {
    const canBeLiberated = await this.upSrv.canBeLiberated(this.upCf._id);

    if (canBeLiberated.result === 'ok') {
      const liberatePopup = this.popupSrv.open(LiberateAdoptionConfirmationPopupComponent, {data: {id: this.upCf._id, close: false}});

      liberatePopup.onClose.subscribe((result) => {
        if (result) {
          this.liberateAdoption.emit();
        } else {
          this.popupSrv.open(LiberateAdoptionInformativePopupComponent, {data: {close: true}});
        }
      });
    } else {
      this.popupSrv.open(LiberateAdoptionInformativePopupComponent, { data: { close: true } });
    }
  }

  /**
   * toggle autoRenew in your up
   */
  public toggleAutoRenew(): void {
    void this.upSrv.toggleAutoRenew(this.upCf._id, this.autoRenewActive);
  }

  public isOneShotAdoptionActive(): boolean {
    return (
      this.isOneShot &&
      this.status.onSeason &&
      !this.status.renewOpen &&
      !this.orderRefunded &&
      !this.season.harvestBreak &&
      !this.upCf.areDeliveredAllBoxes
    );
  }

  public isMultiShotsAdoptionActive(): boolean {
    return (
      this.isMultiShot &&
      this.status.onSeason &&
      !(this.status.renewOpen && this.masterBoxLeft === 0) &&
      !this.season.harvestBreak &&
      !this.upCf.areDeliveredAllBoxes
    );
  }

  // Get arrival estimate date from the last order (only ONE_SHOT)
  public getArrivalEstimateDate(): string {
    return this.orders[0]?.shipment?.arrivalEstimateDate || '';
  }

  private checkMasterBoxLeft(): void {
    if (this.masterBoxLeft < 0) {
      this.masterBoxLeft = 0;
      this.loggerSrv.error('masterboxLeft should be more than 0', { masterBoxLeft: this.masterBoxLeft, upCf: this.upCf._id });
    }
  }

  navigateToFarmersMarket(): void {
    this.routerSrv.navigateToFarmersMarket('ADOPTION');
  }
}
