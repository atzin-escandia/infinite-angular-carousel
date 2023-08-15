import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CartsService, CountryService, RouterService, TrackingConstants, TrackingService, CalendarService } from '@app/services';
import { BaseComponent } from '@components/base';
import { Subscription } from 'rxjs';
import { CostsCalculatorPopupComponent } from '../../popups/costs-calculator-popup';
import { CountriesPopupComponent } from '@popups/countries-selector';
import { TypeOfSelling } from '@enums/types-of-selling.enum';
import { FarmerPageService } from '@pages/farmer/farmer.page.service';
import { TranslocoService } from '@ngneat/transloco';
import { MULTI_SHOTS, ONE_SHOT, OVERHARVEST, OVERHARVEST_KEY } from '../../constants/up.constants';
import { ConfigService } from '@services/config/config.service';
import { REMOTE_CONFIG } from '@app/constants/remote-config.constants';
import { Device } from '@app/enums/device.enum';
import { IEcommerceTracking } from '@app/interfaces';
import { TrackingGA4ImpressionIds } from '@app/enums/filters.enum';

@Component({
  selector: 'up-card',
  templateUrl: './up-card.component.html',
  styleUrls: ['./up-card.component.scss']
})
export class UpCardComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges {
  @Input() public cardInfo: any = {};
  @Input() public location: string;
  @Input() public availableCountriesByISO: any;
  @Input() public countriesByIso: any;
  @Input() public ss: any;
  @Input() public isCardOpen = false;
  @Input() public price: any;
  @Input() public gift = false;
  @Output() public openLocationEvn = new EventEmitter<void>();
  @Output() public refreshPriceEvn = new EventEmitter<any>();
  @Output() public closeCardEvt = new EventEmitter<any>();

  // Card type
  public isAdoption = false;
  public isOHTabActive = false;
  public isMixed = false;
  public isOneshot = false;
  public isUber = false;
  public selectedLocation: any;
  public selectedTab: string = TypeOfSelling.ADOPT;
  public numberOfBoxes: number;
  public masterBoxes = {up: [], oh: []};
  public selectedMasterBox: any;
  public upName: string;
  public totalPrice: number;
  public currentUber = 0;
  public uberImages: any;
  public uberUpSelected: any = {};
  public productNotificationOpen = false;
  public yourUpErr: any;
  public countrySubscription: Subscription;
  public isGiftSelected = {
    isActiveGift: false,
    info: {
      name: null,
      email: null,
      message: null,
      schedule: false,
      date: new Date(),
      isPrivacy: false
    },
  };

  constructor(public injector: Injector, public trackingSrv: TrackingService,
    public cartSrv: CartsService, public routerSrv: RouterService,
    public countrySrv: CountryService, private farmerPageSrv: FarmerPageService,
    private calendarSrv: CalendarService, private translocoSrv: TranslocoService,
    public configSrv: ConfigService) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    // Load Farmer page service
    this.farmerPageSrv.init();

    this.selectedLocation = this.location;

    if ([0, 1, 4, 5, 8, 9, 12, 13].indexOf(this.cardInfo.projectType) > -1) {
      this.isAdoption = true;
    } else {
      this.isMixed = true;
    }

    this.configSrv.getBoolean(REMOTE_CONFIG.SHOW_OH_ADOPTION_PAGE).subscribe(v => this.isOHTabActive = v);

    this.isOneshot = this.cardInfo.up.sellingMethod === 'ONE_SHOT';
    this.isUber = this.cardInfo.up.typeUpSell === 'UBER_UPS';
    this.selectedTab = (!this.ss.upsAvailable && !this.ss.inSeason) ||
      (!this.ss.upsAvailable && this.ss.inSeason && this.ss.ohAvailable) ? TypeOfSelling.BUY : TypeOfSelling.ADOPT;
    this.numberOfBoxes = (this.isMixed && this.selectedTab === TypeOfSelling.BUY) ? 1 : this.cardInfo.up.minStepMS;

    if (this.domSrv.getIsDeviceSize(Device.LAPTOP) || this.isUber) {
      this.isCardOpen = true;
    }

    await this.loadMasterBoxesData();

    this.refreshPriceEvn.emit({
      totalBoxes: this.numberOfBoxes,
      location: this.selectedLocation,
      overharvest: this.isMixed && this.selectedTab === TypeOfSelling.BUY
    });

    this.countrySubscription = this.countrySrv.countryChange().subscribe(async country => {
      this.selectedLocation = country;
      // Load master boxes data whenever the country change
      await this.loadMasterBoxesData();
      // Refresh price
      this.refreshPrice();
    });
  }

  ngOnDestroy(): void {
    if (this.countrySubscription) {
      this.countrySubscription.unsubscribe();
      this.domSrv.removeClasses('body', ['no-scroll']);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (!changes.ss) {
      return;
    }

    if (this.cardInfo.up.typeUpSell === 'UBER_UPS' && (!this.uberImages || this.uberImages.length === 0)) {
      this.uberImages = this.cardInfo.up.uberUps?.map((uberUp: any) => uberUp.pictureURL);
      this.selectCurrentUberUp();
    }
  }

  public selectGift(isGiftOptChecked: boolean): void {
    this.cardInfo.gift = this.isGiftSelected || {};
    this.cardInfo.gift.isActiveGift = isGiftOptChecked;
  }

  private refreshPrice(): void {
    this.refreshPriceEvn.emit({
      totalBoxes: this.numberOfBoxes,
      location: this.selectedLocation,
      overharvest: this.isMixed && this.selectedTab === TypeOfSelling.BUY
    });
  }

  private async loadMasterBoxesData(): Promise<void> {
    await this.getMBsFirstAvailableDate();
    this.setMasterBoxes();
    this.setInitialSelectedMasterBox();
  }

  /**
   * Get the first available shipping date for each master box
   */
  private async getMBsFirstAvailableDate(): Promise<void> {
    for (const mb of this.cardInfo.up.masterBoxes) {
      try {
        const mbAvailableDates = await this.calendarSrv.getAvailableDates(this.selectedLocation, {
          type: this.cardInfo.up.sellingMethod === MULTI_SHOTS ? OVERHARVEST : ONE_SHOT,
          masterBox: mb._id,
          up: this.cardInfo.up,
          ...{stepMS: this.cardInfo.up.minStepMS},
        });

        if (mbAvailableDates?.length) {
          mb.firstDate = mbAvailableDates[0];
        }
      } catch (e) {
        mb.firstDate = null;
      }
    }
  }

  public getMasterBoxes(): any[] {
    return this.selectedTab === TypeOfSelling.ADOPT ? this.masterBoxes.up : this.masterBoxes.oh;
  }

  private setMasterBoxes(): void {
    this.masterBoxes.up = this.cardInfo.up.masterBoxes.filter((mb: any) => mb.adoptionActive);
    this.masterBoxes.oh = this.cardInfo.up.masterBoxes.filter((mb: any) => mb.ohActive);
    this.cardInfo.up.masterBoxes = this.getMasterBoxes();
  }

  private setSelectedMasterBox(index = 0): void {
    this.selectedMasterBox = this.selectedTab === TypeOfSelling.ADOPT ? this.masterBoxes.up[index] : this.masterBoxes.oh[index];
    this.cardInfo.up.selectedMasterBox = this.selectedMasterBox;
  }

  private setInitialSelectedMasterBox(): void {
    const { selectedMbIndex, boxParam } = this.farmerPageSrv.getSelectedMbIndexAndBoxParam(this.cardInfo.up);

    this.setSelectedMasterBox(selectedMbIndex);
    boxParam && this.farmerPageSrv.setBoxQueryParam(this.cardInfo.up);
  }

  /**
   * toggleCard
   */
  public toggleCard(evt: boolean): void {
    this.isCardOpen = evt;
  }

  /**
   * Close card for Mobile
   */
  public closeCardMobile(): void {
    this.closeCardEvt.emit(false);
  }

  /**
   * Open location selector popup
   */
  public openLocationSelector(): void {
    const countriesPopup = this.popupSrv.open(CountriesPopupComponent, {
      data: {
        countries: this.availableCountriesByISO,
        flag: true,
        source: 'up-card',
        selectedLocation: this.selectedLocation
      }
    });

    countriesPopup.onClose.subscribe(result => {
      if (result || result === 0) {
        this.selectedLocation = this.availableCountriesByISO[result].iso;
        this.countrySrv.setCountry(this.availableCountriesByISO[result].iso);
        // Refresh price
        this.refreshPriceEvn.emit({
          totalBoxes: this.numberOfBoxes,
          location: this.selectedLocation,
          overharvest: this.isMixed && this.selectedTab === TypeOfSelling.BUY
        });
      }
    });
  }

  /**
   * Open Calculate Shipping Costs popup
   */
  public openShippingCostsCalculatorPopUp(): void {
    const shippingCostsCalculatorPopup = this.popupSrv.open(CostsCalculatorPopupComponent, {
      data: {
        close: true,
        isFullHeight: this.domSrv.getIsDeviceSize(),
        availableCountriesByISO: this.availableCountriesByISO,
        location: this.location,
        weight: this.selectedMasterBox ? this.selectedMasterBox.weight : this.cardInfo.up.masterBoxes[0]?.weight,
        weightUnit: this.selectedMasterBox ? this.selectedMasterBox.weightUnit : this.cardInfo.up.masterBoxes[0].weightUnit,
        numberOfBoxes: this.numberOfBoxes,
        minStepMS: this.cardInfo.up.minStepMS,
        maxStepMS: this.cardInfo.up.maxStepMS,
        isMultishot: !this.isOneshot,
        price: this.price,
        up: this.cardInfo.up
      }
    });

    const parentPopups = document.getElementsByClassName('popups')[0] as HTMLElement;

    if (parentPopups) {
      this.domSrv.addClassesAllDevices('.popups', ['cost-calculator-popups']);
    }
  }

  public updateQuantity(quantity: number): void {
    this.numberOfBoxes = quantity;
  }

  public changeCardTab(tab: string): void {
    this.selectedTab = tab;
    this.numberOfBoxes = (this.isMixed && this.selectedTab === TypeOfSelling.BUY) ? 1 : this.cardInfo.up.minStepMS;
    this.cardInfo.up.masterBoxes = this.getMasterBoxes();
    this.setInitialSelectedMasterBox();
    this.farmerPageSrv.setBoxQueryParam(this.cardInfo.up);

    this.refreshPriceEvn.emit({
      totalBoxes: this.numberOfBoxes,
      location: this.selectedLocation,
      overharvest: this.isMixed && this.selectedTab === TypeOfSelling.BUY
    });
  }

  /**
   * Change and updates ums value, then recalcultes price
   *
   * @param step 1 | -1
   */
  public addSubsctractUms(step: number): void {
    this.numberOfBoxes = this.numberOfBoxes + step;
    // Refresh price
    this.refreshPriceEvn.emit({
      totalBoxes: this.numberOfBoxes,
      location: this.selectedLocation,
      overharvest: this.isMixed && this.selectedTab === TypeOfSelling.BUY
    });
  }

  /**
   * changeUberImg
   */
  public changeUberImg(step: number): void {
    if ((step < 0 && this.currentUber === 0) || (step > 0 && this.currentUber >= this.uberImages.length - 1)) {
      return;
    }

    this.currentUber += step;

    this.selectCurrentUberUp();
  }

  /**
   * Select current uberUp
   */
  public selectCurrentUberUp(): void {
    if (this.cardInfo.up.typeUpSell !== 'UBER_UPS') {
      return;
    }
    this.uberUpSelected = this.cardInfo.up.uberUps[this.currentUber];
  }

  /**
   * Select MasterBox
   */
  public selectMasterBox(mb: any, index: number): void {
    if (this.isMbAvailable(mb)) {
      this.setSelectedMasterBox(index);
      this.farmerPageSrv.setBoxQueryParam(this.cardInfo.up);
      this.numberOfBoxes = (this.isMixed && this.selectedTab === TypeOfSelling.BUY) ? 1 : this.cardInfo.up.minStepMS;
      this.refreshPriceEvn.emit({
        up: this.cardInfo.up,
        totalBoxes: this.numberOfBoxes,
        location: this.selectedLocation,
        overharvest: this.isMixed && this.selectedTab === TypeOfSelling.BUY
      });
    }
  }

  public isMbAvailable(mb: any): boolean {
    return !!mb?.firstDate;
  }

  public getOptionMasterBoxValue(mb: any): string {
    const {weight, weightUnit}: {weight: string; weightUnit: string} = mb;
    const textMbNotAvailable: string = this.isMbAvailable(mb) ? '' : this.translocoSrv.translate('page.not-available-box.drop');

    return `${weight} ${weightUnit} ${textMbNotAvailable}`;
  }

  public getWeightInfoForOS(): string {
    const weightInfo: string = this.selectedMasterBox ? this.selectedMasterBox.weight + this.selectedMasterBox.weightUnit :
      this.cardInfo.up.masterBoxes[0].weight + this.cardInfo.up.masterBoxes[0].weightUnit;

    return `${weightInfo}/${this.translocoSrv.translate<string>('global.box.text')}`;
  }

  // Required conditions
  public validName(fromTop?: boolean): boolean {
    this.yourUpErr = {};

    if (this.cardInfo.up.typeUpSell === 'UBER_UPS') {
      // Select a uberUp
      if (!this.uberUpSelected) {
        this.yourUpErr.uberUp = true;

        return false;
      } else {
        if (this.uberUpSelected >= this.cardInfo.up.maxCrowdfarmersByItem) {
          this.yourUpErr.uberUpFull = true;

          return false;
        }
      }
    } else if (this.isAdoption || (this.isMixed && this.selectedTab === TypeOfSelling.ADOPT)) {
      // Name your up
      if (!this.upName || this.upName.length <= 0) {
        if (!fromTop) {
          this.yourUpErr.name = true;
        }

        return false;
      }

      // Select a valid name
      if (!this.utilsSrv.isValidName(this.upName) && this.cardInfo.up.typeUpSell !== 'UBER_UPS') {
        this.yourUpErr.format = true;

        return false;
      }
    }

    return true;
  }

  // Check if adoption is available
  private isAdoptionAvailable(scrollUberUp: boolean): boolean {
    if (!this.location) {
      this.openLocationSelector();

      return false;
    }

    return this.validName(scrollUberUp);
  }

  /*
   * Method to stylize the "Adopt/Buy a box" tabs.
   */
  public styleAdoptOhTabs(): {[klass: string]: any} {
    const cardInfoTop = '-' + this.domSrv.getElementHeight('#card-info') + 'px';
    const cardHeaderTitleHeightWithTabs = '-' + (this.domSrv.getElementHeight('#card-header-title') + 48) + 'px';
    const cardHeaderTitleHeightWithoutTabs = '-' + (this.domSrv.getElementHeight('#card-header-title') + 32) + 'px';
    const cardHeaderTitleTop = this.showAdoptOhTabs() ? cardHeaderTitleHeightWithTabs : cardHeaderTitleHeightWithoutTabs;

    return {top: this.isCardOpen ? cardInfoTop : cardHeaderTitleTop, 'z-index': this.isCardOpen ? 3 : 1};
  }

  /*
   * Method to check if we have to show the "Adopt/Buy a box" tabs.
   * returns true if we have ups and oh in season (available shipping dates) and available oh units.
   * In other case, return false.
   */
  public showAdoptOhTabs(): boolean {
    const activeUpAndOhInSeason = this.isMixed && this.ss.inSeason && this.ss.upsAvailable && this.ss.ohAvailable;
    const hasAvailableOhUnits = this.isOHTabActive;

    return activeUpAndOhInSeason && hasAvailableOhUnits;
  }

  public isUberUpProjectType(): boolean {
    return [0, 2, 4, 6, 8, 10, 12, 14].indexOf(this.cardInfo.projectType) > -1;
  }

  // Add to cart
  public addToCart(e: any, scrollUberUp: boolean = false): void {
    e.preventDefault();
    if (this.productNotificationOpen) {
      return;
    }

    if (!this.isAdoptionAvailable(scrollUberUp)) {
      return;
    }

    // Add gift cart service
    this.cardInfo.gift = this.isGiftSelected;

    this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.ADD_TO_CART, true, {
      add: {
        products: [{
          name: this.cardInfo.up.code,
          id: this.cardInfo.up._id.toString(),
          category: this.cardInfo.up._m_up[this.langSrv.getCurrentLang()],
          price: this.price.amount,
          brand: this.cardInfo.farmer.company.brandName,
          quantity: 1,
          variant: TrackingConstants.GTM.PARAMS.ADOPT
        }]
      }
    }, TrackingConstants.GTM.ACTIONS.PURCHASE_MODULE);

    const purchaseType = this.isAdoption || (this.isMixed && this.selectedTab === TypeOfSelling.ADOPT) ? 'adoption' : OVERHARVEST_KEY;

    // Add to cart service
    this.cartSrv.add(
      purchaseType,
      this.cardInfo.up,
      this.cardInfo.up.typeUpSell === 'UBER_UPS' ? this.uberUpSelected.name : this.upName || null,
      null,
      this.cardInfo.up.selectedMasterBox._id,
      {
        ...(this.isAdoption || (this.isMixed && this.selectedTab === TypeOfSelling.ADOPT) ?
          {stepMS: this.numberOfBoxes} :
          {numMasterBoxes: this.numberOfBoxes}
        )
      },
      (this.cardInfo.up.typeUpSell === 'UBER_UPS' && purchaseType === 'adoption' ? this.uberUpSelected : null),
      this.cardInfo.farmer.slug,
      {
        oneShot: this.cardInfo.up.sellingMethod === 'ONE_SHOT',
        multiShot: this.cardInfo.up.sellingMethod === 'MULTI_SHOTS',
        uberUp: this.cardInfo.up.typeUpSell === 'UBER_UPS'
      },
      null,
      null,
      null,
      this.cardInfo.gift
    );

    this.productNotificationOpen = true;
    this.cardInfo.up.masterBox = this.cardInfo.up.masterBoxes.find((mb) => mb._id === this.cardInfo.up.selectedMasterBox._id);
    this.trackGA4AddToCart();
    this.routerSrv.navigateToOrderSection('cart');
  }

  private trackGA4AddToCart(): void {
    const PRODUCT_CODE = this.cardInfo?.up?.code;
    const trackingProjectAlreadyVisited = PRODUCT_CODE && this.storageSrv.get(PRODUCT_CODE);
    const items: IEcommerceTracking[] = [];
    const listName = trackingProjectAlreadyVisited?.item_list_name ?? TrackingGA4ImpressionIds.DIRECT;
    const position = trackingProjectAlreadyVisited?.index ?? this.trackingSrv.getPosition();
    const farmName = this.cardInfo.farmer?.farms?.find(farm => farm._id === this.cardInfo.up?._farm)?._m_name?.en;

    items.push({
      index: position,
      item_brand: farmName,
      currency: this.price?.currency?.crowdfarmer?.currency,
      price: this.price?.amount,
      item_variant: TrackingConstants.ITEM_VARIANT.ADOPT,
      quantity: 1,
      item_id: this.cardInfo.up?._id,
      item_category: this.cardInfo.up?._m_category?.en,
      item_category2: this.cardInfo.up?._m_subcategory?.en,
      item_category3: this.cardInfo.up?._m_variety?.en,
      item_category4: this.cardInfo.up?._m_subvariety?.en,
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

    this.trackingSrv.trackEventGA4( TrackingConstants.GTM4.EVENTS.ADD_TO_CART, true, { items });

  }

}
