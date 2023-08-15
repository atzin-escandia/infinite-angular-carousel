/* eslint-disable max-lines */
import { Component, HostListener, Injector, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BasePage } from '@pages/base';
import {
  AuthService,
  CalendarService,
  CartsService,
  CrossSellingService,
  FarmerService,
  IpapiService,
  ProjectsService,
  SeasonsService,
  TrackingConstants,
  TrackingService,
  UpService,
  UserService,
  SubscriptionService,
  CountryService,
  FavouriteService,
} from '@app/services';
import { SealsService } from '../services/seals';
import {
  CS_FARMER_PAGE_ACTION_NAME,
  CS_FARMER_PAGE_LIST_NAME,
  CS_OH_HEADER,
  CS_OVERHARVEST_LIMIT,
  OH_FAQ_ANSWER_COVID,
  OH_FAQ_ANSWER_IMPACT,
  OH_FAQ_ANSWER_SHIPPING,
  OH_FAQ_ANSWER_WARRANT,
  OH_FAQ_QUESTION_COVID,
  OH_FAQ_QUESTION_IMPACT,
  OH_FAQ_QUESTION_SHIPPING,
  OH_FAQ_QUESTION_WARRANT,
  OH_PAGE_SELECTOR,
  OVERHARVEST,
  OVERHARVEST_SUFFIX,
} from './constants/overharvest.constants';
import { PopoverService } from '@services/popover';
import { Subscription } from 'rxjs';
import { UpType } from '../enums/up-type.enum';
import { IFaqsOh } from './interfaces/faqs-oh.interface';
import { IExtraInfoOh } from './interfaces/extra-info-oh.interface';
import { IInfoBlocksOh } from './interfaces/info-blocks-oh.interface';
import { IFarmOh } from './interfaces/farm-oh.interface';
import { IFarmerOh } from './interfaces/farmer-oh.interface';
import { IOhParamsSeo } from './interfaces/params-seo-oh.interface';
import { AUTO_SEO_DESCRIPTION, AUTO_SEO_TITLE } from '../constants/farmer.constants';
import { FarmerPageService } from '../farmer.page.service';
import * as dayjs from 'dayjs';
import { ISubscriptionAvailability, ISubscriptionConfiguration } from '@interfaces/subscription.interface';
import { CROSS_SELLING_LOCATIONS } from '@constants/cross-selling.constants';
import { CompleteSeals, ICrossSellingProjectParams, IEcommerceTracking } from '@app/interfaces';
import { ActivatedRoute } from '@angular/router';
import { TrackingGA4ImpressionIds, TrackingImpressionIds } from '@app/enums/filters.enum';

@Component({
  selector: 'overharvest-page',
  templateUrl: './overharvest.page.html',
  styleUrls: ['./overharvest.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OverharvestPageComponent extends BasePage implements OnInit, OnDestroy {
  public up: any;
  private farm: IFarmOh;
  public farmer: IFarmerOh;
  public videoURL: string;
  private userData: any;
  public price: any;
  private paramsSubscription: Subscription;
  private countrySubscription: Subscription;
  private languageSubscription: Subscription;
  public subscriptionAvailability?: ISubscriptionAvailability;
  private totalBoxes = 1;
  public country: string;
  private ohPictures: string[] = [];
  public availableDates: string[];
  public infoBlocks: IInfoBlocksOh[] = [];
  public upSeals: CompleteSeals = {
    header: [],
    detailHeader: [],
    official: [],
    unOfficial: [],
  };
  public faqs: IFaqsOh[] = [];
  public season: any;
  public extraInfo: IExtraInfoOh[] = [];
  public fixedCta = false;
  public availableCountriesByISO = [];
  public isAnimalOrHive = false;

  public showCs = false;
  public isCsActive = false;
  public csParams: any = {};
  public currentMasterBox: any = {};

  public csSpecifications: any = {
    ohProjects: {
      header: CS_OH_HEADER,
      trackingListName: CS_FARMER_PAGE_LIST_NAME,
      trackingGA4ListName: 'CS_Farmers_Market_OH/Available_OH',
    },
    trackingActionName: CS_FARMER_PAGE_ACTION_NAME,
  };

  @HostListener('window:scroll', ['$event'])
  onScroll(_e: Event): void {
    this.fixCta();
  }
  constructor(
    public injector: Injector,
    public activatedRoute: ActivatedRoute,
    public upSrv: UpService,
    public popoverSrv: PopoverService,
    private farmerSrv: FarmerService,
    private ipapiSrv: IpapiService,
    private userSrv: UserService,
    private cartSrv: CartsService,
    private subscriptionSrv: SubscriptionService,
    private trackingSrv: TrackingService,
    private calendarSrv: CalendarService,
    private sealSrv: SealsService,
    private seasonSrv: SeasonsService,
    private authSrv: AuthService,
    private projectsSrv: ProjectsService,
    private farmerPageSrv: FarmerPageService,
    private crossSellingSrv: CrossSellingService,
    public countrySrv: CountryService,
    public favouriteSrv: FavouriteService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    // Load Cross Selling Active Params from Firebase
    this.crossSellingSrv.isCsActive(CROSS_SELLING_LOCATIONS.UP_PAGE).subscribe(() => {
      this.isCsActive = true;
    });

    // Load Farmer page service
    this.farmerPageSrv.init();

    this.paramsSubscription = this.activatedRoute.params.subscribe(async () => {
      await this._loadData(true);
      this.trackingSrv.setTradeDoublerOHDetail(this);
    });

    this.countrySubscription = this.countrySrv.countryChange().subscribe(async () => {
      await this._loadData();
    });

    this.languageSubscription = this.langSrv.getCurrent().subscribe(() => {
      this.buildFaqs();
    });
  }

  private buildFaqs(): void {
    this.faqs = [
      {
        question: this.textSrv.getText(OH_FAQ_QUESTION_IMPACT),
        answer: this.textSrv.getText(OH_FAQ_ANSWER_IMPACT),
      },
      {
        question: this.textSrv.getText(OH_FAQ_QUESTION_SHIPPING),
        answer: this.textSrv.getText(OH_FAQ_ANSWER_SHIPPING),
      },
      {
        question: this.textSrv.getText(OH_FAQ_QUESTION_WARRANT),
        answer: this.textSrv.getText(OH_FAQ_ANSWER_WARRANT),
      },
      {
        question: this.textSrv.getText(OH_FAQ_QUESTION_COVID),
        answer: this.textSrv.getText(OH_FAQ_ANSWER_COVID),
      },
    ];

    void this.favouriteSrv.setCrowdfarmer();
  }

  private async _loadData(init = false): Promise<void> {
    // Get location with IPAPI
    try {
      this.country = await this.ipapiSrv.get();
    } catch (e) {
      console.error(e);
    }

    // Load contries
    await Promise.allSettled([this.sealSrv.setAllSeals(), this.loadCountriesByISO()]);

    this.country = this.countrySrv.getCountry();

    // Loads only onInit
    if (init) {
      await this.loadDataInit();
    } else {
      // Only need to refresh up to get prices
      await this.loadUpData();
    }

    if (this.up) {
      // Loads onInit and on country/lang change
      await this.getMBsFirstAvailableDate();
      this.setInitialSelectedMasterBox();
      this.getPrice();
      await this.getDates();
      await this.getSubscriptionInfo();
      await this.loadCountryData();

      if (this.availableDates === null || this.availableDates.length === 0) {
        if (this.country) {
          this.csParams.country = this.country;
        }

        if (this.authSrv.isLogged()) {
          this.user = await this.userSrv.get();

          if (this.user) {
            this.csParams.user = this.user._id;
          }
        }

        this.csParams.limit = CS_OVERHARVEST_LIMIT;
        this.csParams.segment = OVERHARVEST;
        this.showCs = true;
      } else {
        this.showCs = false;
      }
      this.trackProductDetail();
      this.trackGA4ProductDetailPage();
      this.setLoading(false);
      this.setInnerLoader(false, false);
    }
  }

  private async loadUpData(): Promise<void> {
    const upSlug = this.getParam('upSlug');

    this.up = await this.upSrv.getBySlug(upSlug, this.country);
    this.up.masterBoxes = this.up.masterBoxes.filter((mb: any) => mb.ohActive);
  }

  private async loadDataInit(): Promise<void> {
    try {
      // Get params from route
      const upSlug = this.getParam('upSlug');
      const farmerSlug = this.getParam('farmerSlug');

      this.userData = this.userSrv.getCurrentUser();
      if (this.userData?.selectAddress?.country) {
        this.country = this.userData.selectAddress.country;
      }

      await this.loadUpData();

      this.farmer = await this.farmerSrv.getBySlug(farmerSlug);
      this.videoURL = this.farmerSrv.getVideoUrl(this.farmer.videoURL, this.up?.farmerNewsUpVideoURL);
      this.season = await this.seasonSrv.get(this.up._currentShippingSeason);

      await this.loadCountries();
      this.loadFarms(this.farmer.farms, this.up);
      this.filterSeals();
      this.checkUpType();

      if (this.up.overharvest.ohPictureURLs.length > 0) {
        this.buildImageGallery();
      }

      await this.setSeoData();

      if (this.up && this.farmer && this.farm) {
        this.buildFarmAndFarmerInfo();
        this.buildFaqs();
        this.buildMap();
      } else {
        this.routerSrv.navigate(`farmer/${farmerSlug}/up/${upSlug}`);
      }
    } catch (error) {
      this.setLoading(false);
      this.routerSrv.navigateToSpecificUrl('BOXES');
    }
  }

  /**
   * Get the first available shipping date for each master box
   */
  private async getMBsFirstAvailableDate(): Promise<void> {
    for (const mb of this.up.masterBoxes) {
      try {
        const mbAvailableDates = await this.calendarSrv.getAvailableDates(this.country, {
          type: OVERHARVEST.toUpperCase(),
          masterBox: mb._id,
          up: this.up,
          ...{ stepMS: this.up.minStepMS },
        });

        if (mbAvailableDates?.length) {
          mb.firstDate = mbAvailableDates[0];
        }
      } catch (e) {
        mb.firstDate = null;
      }
    }
  }

  private setInitialSelectedMasterBox(): void {
    const { selectedMbIndex, boxParam } = this.farmerPageSrv.getSelectedMbIndexAndBoxParam(this.up);

    this.up.selectedMasterBox = this.up.masterBoxes[selectedMbIndex];
    this.currentMasterBox = this.up.selectedMasterBox;

    if (boxParam) {
      this.farmerPageSrv.setBoxQueryParam(this.up);
    }
  }

  private buildImageGallery(): void {
    for (const pic of this.up.overharvest.ohPictureURLs) {
      this.ohPictures.push(pic.url);
    }
  }

  private buildFarmAndFarmerInfo(): void {
    this.infoBlocks = [
      {
        id: 'farmer',
        name: `${this.farmer.name} ${this.farmer.surnames}`,
        _m_text: this.farmer._m_biography,
        pictureURL: this.farmer.pictureURL,
      },
      {
        id: 'farm',
        name: this.farm.name,
        _m_text: this.farm._m_description,
        pictureURL: this.up.overharvest.descriptionPictureURL,
      },
    ];

    const address = `${this.farm.name}, ${this.farm.address?.city}, ${this.farm.address?.country.toUpperCase()}`;

    this.extraInfo = [
      {
        type: 'direction',
        value: address,
        _m_value: {
          de: address,
          en: address,
          es: address,
          fr: address,
          nl: address,
          it: address,
          sv: address,
        },
      },
    ];

    this.extraInfo = [...this.extraInfo, ...this.farm.extraInfo];
  }

  private buildMap(): void {
    if (this.domSrv.isPlatformBrowser() && this.domSrv.getElement('.map-frame')) {
      this.domSrv.getElement('.map-frame').setAttribute('src', this.farm.mapURL);
    }
  }

  private trackProductDetail(): void {
    let list = this.trackingSrv.getInterimList();

    if (!list) {
      this.trackingSrv.setInterimList(TrackingImpressionIds.FARMERS_MARKET_OH);
      list = this.trackingSrv.getInterimList();
    }

    this.trackingSrv.addGroup(TrackingConstants.GTM.PAGE_TYPE.FARMER, this.farmer.company.farmerCode);
    this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.PRODUCT_DETAIL, true, {
      detail: {
        actionField: { list },
        products: [
          {
            name: this.up?.code,
            id: this.up?._id.toString(),
            category: this.up?._m_up[this.langSrv.getCurrentLang()],
            price: this.price?.amount || null,
            brand: this.farmer?.company?.brandName,
            variant: TrackingConstants.GTM.PARAMS.OVERHARVEST,
            position: this.trackingSrv.getPosition(),
          },
        ],
      },
    });
  }

  private trackGA4ProductDetailPage(): void {
    const customEventData = {
      cf_page_title: '',
      page_type: '',
      language: this.langSrv.getCurrentLang(),
      country_delivery: this.countrySrv.getCurrentCountry()?.iso,
    };
    const PRODUCT_CODE = this.up?.code;
    const trackingProjectAlreadyVisited = PRODUCT_CODE && this.storageSrv.get(PRODUCT_CODE);
    const items: IEcommerceTracking[] = [];
    const listName = trackingProjectAlreadyVisited?.item_list_name ?? TrackingGA4ImpressionIds.DIRECT;
    const position = trackingProjectAlreadyVisited?.index ?? this.trackingSrv.getPosition();
    const countryCurrency = this.countrySrv.getCurrentCountry()?.currency;

    customEventData.page_type = TrackingConstants.GTM4.PAGE_TYPE.OVERHARVEST_PDP;
    customEventData.cf_page_title = TrackingConstants.GTM4.CF_PAGE_TITLE.OVERHARVEST_PDP_PREFIX + PRODUCT_CODE;
    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PAGE_VIEW, false, customEventData);

    // TODO: fill in with IEcommerceTracking
    items.push({
      index: position,
      item_brand: this.farm?._m_name?.en,
      currency: countryCurrency,
      price: this.price?.amount || null,
      item_variant: TrackingConstants.ITEM_VARIANT.OH,
      quantity: 1,
      item_id: this.up?._id,
      item_category: this.up?._m_category?.en,
      item_category2: this.up?._m_subcategory?.en,
      item_category3: this.up?._m_variety?.en,
      item_category4: this.up?._m_subvariety?.en,
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

    if (listName === TrackingGA4ImpressionIds.DIRECT) {
      const currentItem: IEcommerceTracking = items[0];

      currentItem && PRODUCT_CODE && this.trackingSrv.saveTrackingStorageProject(PRODUCT_CODE, currentItem);
    }
    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.VIEW_ITEM, true, { items });
  }

  /**
   * Get price of overharvest
   */
  private getPrice(): void {
    this.price = {
      ...this.price,
      amount: this.up?.selectedMasterBox?.price?.amount * this.totalBoxes,
    };
  }

  /**
   * Set seo
   */
  private async setSeoData(): Promise<void> {
    const upType: string = this.up.upType ? this.up.upType : 'TREE';
    const seoReplacements = {
      '{publicVariety}': this.up.publicVariety,
      '{farmName}': this.farm.name,
      '{cityfarm}': this.farm.address.city,
      '{farmerName}': this.farmer.name,
      '{countryFarm}': this.countriesByIso[this.farm.address.country].name,
      '{production}': this.up.production,
      '{productionCapital}': this.up.production.charAt(0).toUpperCase() + this.up.production.slice(1),
    };

    const link =
      `${this.env.domain}/${this.langSrv.getCurrentLang()}/farmer/` +
      this.farmer.slug +
      '/up/' +
      (this.up._m_slug[this.langSrv.getCurrentLang()] || this.up._m_slug.en) +
      OVERHARVEST_SUFFIX;

    const params: IOhParamsSeo = {
      title: this.textSrv.getText([AUTO_SEO_TITLE, 'OH', upType].join(' '), seoReplacements),
      description: this.textSrv.getText([AUTO_SEO_DESCRIPTION, 'OH', upType].join(' '), seoReplacements),
      og: {
        title: this.textSrv.getText([AUTO_SEO_TITLE, 'OH', upType].join(' '), seoReplacements),
        description: this.textSrv.getText([AUTO_SEO_DESCRIPTION, 'OH', upType].join(' '), seoReplacements),
        url: link,
        image: this.ohPictures,
      },
    };

    let jsonSeo: any = false;

    try {
      const prices = await this.projectsSrv.getPrices(this.up.code);

      const offers = [];

      for (const country of prices) {
        offers.push({
          '@type': 'Offer',
          price: country.ohPrice,
          priceCurrency: country.ohCurrency,
          url: link,
          availability: 'https://schema.org/InStock',
          priceValidUntil: dayjs.utc().add(1, 'month').format('YYYY-MM-DD'),
          eligibleRegion: country.iso,
        });
      }

      jsonSeo = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: params.title.split('|')[0],
        image: this.up.introPicturesURLs,
        description: params.description,
        brand: {
          '@type': 'Brand',
          name: this.farm.name,
        },
        offers,
      };
    } catch (e) {
      // nothing
    }

    this.setSeo(params, jsonSeo);
    this.seoSrv.addCanonical(link);
  }

  /**
   * Load farm of project
   */
  private loadFarms(farms: any[], dataUp: any): void {
    for (const farm of farms) {
      if (farm._id === dataUp._farm) {
        this.farm = farm;
        break;
      }
    }
  }

  public handleClickBuyNow(): void {
    this.addOverHarvest({
      isSubscriptionAvailable: !!this.subscriptionAvailability?.active,
    });
  }

  /**
   * Add overharvest to cart
   */
  public addOverHarvest({
    frequency,
    selectedDate,
    isSubscriptionAvailable,
  }: {
    selectedDate?: string;
    frequency?: Omit<ISubscriptionConfiguration, 'date'>;
    isSubscriptionAvailable: boolean;
  }): void {
    this.trackAddToCart();
    this.trackGA4AddToCart();
    this.addToCart(selectedDate, frequency, isSubscriptionAvailable);
  }

  private trackAddToCart(): void {
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
              price: this.price.amount / (this.totalBoxes || 1),
              brand: this.farmer.company.brandName,
              quantity: this.totalBoxes || 1,
              variant: TrackingConstants.GTM.PARAMS.OVERHARVEST,
            },
          ],
        },
      },
      TrackingConstants.GTM.ACTIONS.OVERHARVEST
    );
  }

  private trackGA4AddToCart(): void {
    const PRODUCT_CODE = this.up?.code;
    const trackingProjectAlreadyVisited = PRODUCT_CODE && this.storageSrv.get(PRODUCT_CODE);
    const items: IEcommerceTracking[] = [];
    const listName = trackingProjectAlreadyVisited?.item_list_name ?? TrackingGA4ImpressionIds.DIRECT;
    const position = trackingProjectAlreadyVisited?.index ?? this.trackingSrv.getPosition();
    const farmName = this.farmer?.farms?.find((farm) => farm._id === this.up?._farm)?._m_name?.en;
    const currentQuantity = this.totalBoxes || 1;
    const countryCurrency = this.countrySrv.getCurrentCountry()?.currency;

    items.push({
      index: position,
      item_brand: farmName,
      currency: countryCurrency,
      price: this.price?.amount / currentQuantity,
      item_variant: TrackingConstants.ITEM_VARIANT.OH,
      quantity: currentQuantity,
      item_id: this.up?._id,
      item_category: this.up?._m_category?.en,
      item_category2: this.up?._m_subcategory?.en,
      item_category3: this.up?._m_variety?.en,
      item_category4: this.up?._m_subvariety?.en,
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

  private addToCart(date, frequency?: Omit<ISubscriptionConfiguration, 'date'>, isSubscriptionAvailable?: boolean): void {
    // Add to cart service
    this.cartSrv.add(
      OVERHARVEST,
      this.up,
      null,
      null,
      this.up.selectedMasterBox._id,
      {
        ...{ numMasterBoxes: this.totalBoxes },
      },
      null,
      this.farmer.slug,
      null,
      date || this.availableDates[0],
      frequency,
      isSubscriptionAvailable
    );

    // Open CS modal
    this.popoverSrv.open(
      'CrossSellingPopoverComponent',
      'header-notification-container',
      {
        inputs: {
          country: this.country,
          product: {
            type: OVERHARVEST,
            name: this.farm.name,
            up: this.up,
            price: this.price.amount,
            boxes: this.totalBoxes || 1,
          },
          imageURL: this.up.cardOHImageURL,
          csParams: this.csParams,
          customClose: () => {
            this.popoverSrv.close('CrossSellingPopoverComponent');
          },
        },
        outputs: {},
      },
      true,
      true
    );
  }

  ngOnDestroy(): void {
    this.paramsSubscription?.unsubscribe();
    this.countrySubscription?.unsubscribe();
    this.languageSubscription?.unsubscribe();
  }

  /**
   * Get oh available shipping dates
   */
  public async getDates(): Promise<void> {
    try {
      this.availableDates = await this.calendarSrv.getAvailableDates(this.country, {
        type: OVERHARVEST.toUpperCase(),
        masterBox: this.up.selectedMasterBox._id,
        up: this.up,
        ...{ stepMS: this.up.minStepMS },
      });
    } catch (e) {
      this.availableDates = null;
    }
  }

  /**
   * Filter seals
   */
  private filterSeals(): void {
    const projectSeals = [].concat(this.up.seals).concat(this.farmer.seals).concat(this.farm.seals);

    this.upSeals = this.sealSrv.getCompleteSeals(projectSeals, this.up.featuredSeal);
  }

  /**
   * activates fixed cta on scroll
   */
  public fixCta(): void {
    this.fixedCta = this.domSrv.scrollUnderOverElement(OH_PAGE_SELECTOR, -640, false, true, true);
  }

  /**
   * from child component emit -> redirects to shopping cart after adding cs product
   */
  public addedCrossSelling(): void {
    this.routerSrv.navigateToOrderSection('cart');
  }

  /**
   * Loads country data
   */
  private async loadCountryData(): Promise<void> {
    if (!this.country) {
      this.country = this.countrySrv.getCountry();
    }
    if (this.countriesByIso) {
      this.countriesByIso = await this.countrySrv.getCountriesByISO();
    }

    // Available countries
    this.availableCountriesByISO = [];
    this.up.selectedMasterBox?.countries.map(({ iso }) => {
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

  /**
   * from child component emit -> adds/substracts boxes and recalculates prices
   */
  public addSubstract(e: number): void {
    this.totalBoxes += e;
    this.getPrice();
  }

  /**
   * from child component emit -> select master box and recalculates prices
   */
  public async selectMasterBox(mb: any): Promise<void> {
    this.currentMasterBox = mb;
    this.totalBoxes = 1;
    this.up.selectedMasterBox = this.up.masterBoxes[mb.index];
    this.farmerPageSrv.setBoxQueryParam(this.up);
    this.getPrice();
    await this.getSubscriptionInfo();
    await this.getDates();
    await this.loadCountryData();
  }

  private async getSubscriptionInfo(): Promise<void> {
    if (this.up.selectedMasterBox?._id && this.up.subscriptionActive) {
      try {
        this.subscriptionAvailability = await this.subscriptionSrv.getSubscriptionAvailability({
          masterBox: this.up.selectedMasterBox._id,
          project: this.up.code,
        });
      } catch (err) {}
    }
  }

  private checkUpType(): void {
    this.isAnimalOrHive = this.up.upType === UpType.ANIMAL || this.up.upType === UpType.HIVE;
  }
}
