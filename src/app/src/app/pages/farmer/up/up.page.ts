/* eslint-disable max-lines */
import { Component, OnInit, Injector, OnDestroy, HostListener, ViewChild } from '@angular/core';
import dayjs from 'dayjs';
import { BasePage } from '@pages/base';
import {
  UpService,
  FarmerService,
  StorageService,
  CalendarService,
  TrackingService,
  TrackingConstants,
  ConfigService,
  StateService,
} from '@app/services';
import { UpPageService } from './up.page.service';
import { GiftService } from '@services/gifts/gift.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { UpCardComponent } from './components';
import {
  SELECTED_OPTION_INFO,
  SUBSCRIBE_POPOVER_REF,
  HEADER_CONTAINER_ID,
  VISITS_COUNTER_KEY,
  UP_SLUG_KEY,
  FARMER_SLUG_KEY,
  MULTI_SHOTS,
  UBER_UPS,
  ACCORDION_POPOVER_REF,
  OPTIONS_BAR_ID,
  UP_CONTENT_SELECTOR,
  ANIMATE_UP_CARD_MOBILE_TIMER,
} from './constants/up.constants';
import { AUTO_SEO_TITLE, UP, AUTO_SEO_DESCRIPTION } from '../constants/farmer.constants';
import { UpType } from '../enums/up-type.enum';
import { UpSections } from './enums/up-sections.enum';
import { OVERHARVEST } from '../overharvest/constants/overharvest.constants';
import { SealsService } from '../services/seals';
import { TagsService } from './services/tags';
import { CompleteSeals, IEcommerceTracking } from '@app/interfaces';
import { HEADER_LOCATION_ID, LOCATION_LANG_POPOVER_REF } from '@modules/farmers-market/constants/filters.constants';
import { first } from 'rxjs/operators';
import { REMOTE_CONFIG } from '@constants/remote-config.constants';
import { ActivatedRoute } from '@angular/router';
import { TrackingGA4ImpressionIds, TrackingImpressionIds } from '@app/enums/filters.enum';

@Component({
  selector: 'up-page',
  templateUrl: './up.page.html',
  styleUrls: ['./up.page.scss'],
})
export class UpPageComponent extends BasePage implements OnInit, OnDestroy {
  private paramsSubscription = new Subscription();
  private billingSeason: any;
  private shippingSeason: any;

  public up: any = {};
  public farmer: any = {};
  public videoURL: string;
  public farm: any = {};
  public price: any;
  public location: string;
  public upInformationReplacements: any = {};
  public ss: any = {}; // SeasonState
  public availableDates: any = []; // SeasonState
  public extraInfo: any = [];
  public isUberUp = false;
  public isMultiShot = false;
  public uberUpSelected: any;
  public allTags: any = [];
  public upSeals: CompleteSeals = {
    header: [],
    detailHeader: [],
    official: [],
    unOfficial: [],
  };
  public upTags: any = [];
  public dataLoaded = false;
  public langSubs: Subscription;
  public introImages: any = [];
  public introImagesAlts: any = [];
  public farmerInfoMore: boolean | void = false;
  public farmInfoMore: boolean | void = false;
  public popoverSubscription: Subscription;
  public popoverListenerToBeLaunched = true;
  public countrySubscription: Subscription;
  public menuOptions: any;
  public selectedOption = SELECTED_OPTION_INFO;
  public headerBoxesInfo: any = {};
  public availableCountriesByISO: any = [];
  public fixedMenu = false;
  public selectedSection = '';
  public isOpenSectionsPopover = false;
  public isCardOpen = false;
  public showUpCardMobile = false;
  public animateUpCardMobile = false;
  public isAGiftSubscription: Subscription;
  public giftOptions: any;
  public isGiftEnabled = false;
  private currentCalculatedPrice: any;

  // UP FEATURES
  public cardInfo: any = {};

  @ViewChild(UpCardComponent)
  public upCardComponent: UpCardComponent;

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    this.loadSubscribePopOver();
    this.fixMenu();
  }

  constructor(
    public injector: Injector,
    public activatedRoute: ActivatedRoute,
    public storageSrv: StorageService,
    public upSrv: UpService,
    public upPageSrv: UpPageService,
    private farmerSrv: FarmerService,
    private calendarSrv: CalendarService,
    private trackingSrv: TrackingService,
    private sealSrv: SealsService,
    private tagSrv: TagsService,
    private configSrv: ConfigService,
    private stateSrv: StateService,
    private giftService: GiftService
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    this.menuOptions = this.upPageSrv.getMenuOptions();

    await this.sealSrv.setAllSeals();

    this.setLangSubscription();
    this.setPopoverSubscription();
    this.setCountrySubscription();
    this.setIsAGiftSubscription();

    if (this.upCardComponent && (!this.domSrv.getIsDeviceSize() || (!this.domSrv.getIsDeviceSize() && !this.isUberUp))) {
      this.domSrv.getElement('html').addEventListener('click', () => {
        this.upCardComponent.toggleCard(false);
      });
    }

    this.paramsSubscription = this.activatedRoute.params.subscribe(async () => {
      await this.loadData();
      this.trackingSrv.setTradeDoublerUPDetail(this.cardInfo);
    });
  }

  ngOnDestroy(): void {
    this.langSubs?.unsubscribe();
    this.popoverSubscription?.unsubscribe();
    this.countrySubscription?.unsubscribe();
    this.isAGiftSubscription?.unsubscribe();
    this.paramsSubscription?.unsubscribe();
    this.eventSrv.dispatchEvent('is-up', { up: false });
    this.popoverSrv.setIfShowSubscribeNewsletter(true);
  }

  /**
   * Load main data
   */
  async loadData(): Promise<void> {
    this.location = this.countrySrv.getCountry();

    // Fetch data from server
    try {
      const rawData = await this.setProjectData();

      if (this.up && this.farmer) {
        const validMasterbox = this.upSrv.getValidMasterBox(this.up, 'ADOPTION') ?? this.upSrv.getValidMasterBox(this.up, 'OVERHARVEST');
        const totalBoxes = this.up.minStepMS;

        await this.setPrice(totalBoxes);
        // Set masterBox
        this.up.selectedMasterBox = validMasterbox;
        this.up.masterBox = validMasterbox;
        this.trackProductDetail();
        this.trackGA4ProductDetailPage();
        await this.loadCountryData();
        await this.calculateSeasonState();

        // Get tags and seals
        this.filterTagsAndSeals();
        this.mergeExtraInfo();
        // Texts replacements
        this.buildInformationReplacements();

        setTimeout(() => {
          this.farmerInfoMore = this.upPageSrv.needsReadMore(
            '.farmer-info .mhEffect .broken-container-text-description',
            '.farmer-info .mhEffect'
          );
          this.farmInfoMore = this.upPageSrv.needsReadMore(
            '.farm-info .mhEffect .broken-container-text-description',
            '.farm-info .mhEffect'
          );
        }, 50);

        // Set intro pictures
        this.introImages = this.up.introPicturesURLs;
        if (this.up.altSeo) {
          this.introImagesAlts = this.up.altSeo.introPicturesURLs;
        }

        await this.checkIsGiftEnabled();

        this.cardInfo = rawData;
        this.cardInfo.farmer = this.farmer;
        if (this.isUberUp) {
          this.cardInfo.up.uberUps = this.cardInfo.up.uberUps.filter((e: any) => e.usedShares >= 0);
        }
      }

      this.setLoading(false);
      this.dataLoaded = true;
      await this.setSeoData();
    } catch (error) {
      console.log(error);
      this.setLoading(false);
      this.dataLoaded = true;
      this.routerSrv.navigateToFarmersMarket('ADOPTION');
    }

    this.up = { ...this.up, farm: this.farm };

    this.setInnerLoader(false, false);
  }

  private setIsAGiftSubscription(): void {
    this.configSrv.isRemoteConfigLoaded$.pipe(first((val) => !!val)).subscribe(() => this.createGiftEnabledSubscription());
  }

  private createGiftEnabledSubscription(): void {
    this.isAGiftSubscription = this.configSrv.getBoolean(REMOTE_CONFIG.GIFT_ENABLED).subscribe(async (v) => {
      this.isGiftEnabled = v;
      await this.checkIsGiftEnabled();
    });
  }

  private async checkIsGiftEnabled(): Promise<void> {
    if (this.isGiftEnabled) {
      this.giftOptions = await this.giftService.checkInfo(this.up.code, this.up.selectedMasterBox?._id, this.location);
    }
  }

  // Setters
  private setLangSubscription(): void {
    this.langSubs = this.langSrv.getCurrent().subscribe(async () => {
      await this.loadData();
      await this.setPrice(this.currentCalculatedPrice);
      this.eventSrv.dispatchEvent('is-up', { up: true });
    });
  }

  private setPopoverSubscription(): void {
    let isSubscribePopoverIsOpen = false;

    this.popoverSubscription = this.popoverSrv.getIfShowSubscribeNewsletter().subscribe((e) => {
      if (e === true && !isSubscribePopoverIsOpen) {
        isSubscribePopoverIsOpen = true;
        this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.OPEN_NEWSLETTER);
        this.popoverSrv.open(SUBSCRIBE_POPOVER_REF, HEADER_CONTAINER_ID, {
          inputs: {},
          outputs: {
            onClose: (element: any) => {
              this.popoverSrv.setIfShowSubscribeNewsletter(element);
              this.storageSrv.set(VISITS_COUNTER_KEY, this.storageSrv.get(VISITS_COUNTER_KEY) + 1);
              this.popoverSrv.close(SUBSCRIBE_POPOVER_REF);
              isSubscribePopoverIsOpen = false;
            },
          },
        });
      }
    });
  }

  private setCountrySubscription(): void {
    this.countrySubscription = this.countrySrv.countryChange().subscribe(async (country) => {
      if (this.location !== country) {
        this.location = country;
        // PRODUCT_MODEL
        try {
          await this.loadData();
          await this.setPrice(this.currentCalculatedPrice);
          await this.setAvailableDates();
        } catch (e) {
          this.setLoading(false);
          this.dataLoaded = true;
        }
      }
    });
  }

  setCalculatedPrice(info: any): void {
    this.currentCalculatedPrice = info;
    void this.setPrice(this.currentCalculatedPrice);
  }

  async setPrice(info: any): Promise<void> {
    this.price = await this.upPageSrv.getPrices(info, this.up, this.location, this.isMultiShot);
  }

  private async setAvailableDates(): Promise<void> {
    this.availableDates = await this.upPageSrv.getDates(this.up, this.location);
  }

  /**
   * Function to fetch data from server
   *
   * @returns rawData from server
   */
  private async setProjectData(): Promise<any> {
    // Get params from route
    const upSlug = this.getParam(UP_SLUG_KEY);
    const farmerSlug = this.getParam(FARMER_SLUG_KEY);

    const rawData = await this.upSrv.getBySlugFull(upSlug, this.location);

    this.up = rawData.up;
    this.billingSeason = rawData.billingSeason;
    this.shippingSeason = rawData.shippingSeason;
    this.availableDates = rawData.availableDates;
    if (this.availableDates?.length > 0) {
      this.headerBoxesInfo.nextDelivery = this.availableDates[0];
    }
    if (this.billingSeason?.remainingUnits > 0) {
      this.headerBoxesInfo.remainingUnits = this.billingSeason.remainingUnits;
    }
    this.farmer = await this.farmerSrv.getBySlug(farmerSlug);
    this.videoURL = this.farmerSrv.getVideoUrl(this.farmer.videoURL, this.up?.farmerNewsUpVideoURL);

    this.allTags = await this.tagSrv.getAll();
    for (const farm of this.farmer.farms) {
      if (farm._id === this.up._farm) {
        this.farm = farm;
        break;
      }
    }

    if (this.up.sellingMethod === MULTI_SHOTS) {
      this.isMultiShot = true;
    }

    if (this.up.typeUpSell === UBER_UPS) {
      this.isUberUp = true;
    }

    return rawData;
  }

  private trackProductDetail(): void {
    let list = this.trackingSrv.getInterimList();

    if (!list) {
      this.trackingSrv.setInterimList(TrackingImpressionIds.FARMERS_MARKET_ADOPTIONS);
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
            brand: this.farmer.company?.brandName,
            variant: TrackingConstants.GTM.PARAMS.ADOPT,
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

    customEventData.page_type = TrackingConstants.GTM4.PAGE_TYPE.ADOPTIONS_PDP;
    customEventData.cf_page_title = TrackingConstants.GTM4.CF_PAGE_TITLE.ADOPTIONS_PDP_PREFIX + PRODUCT_CODE;
    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PAGE_VIEW, false, customEventData);

    // TODO: fill in with IEcommerceTracking
    items.push({
      index: position,
      item_brand: this.farm?._m_name?.en,
      currency: this.price?.currency?.crowdfarmer?.currency,
      price: this.price?.amount || null,
      item_variant: TrackingConstants.ITEM_VARIANT.ADOPT,
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
   * Loads country data
   */
  private async loadCountryData(): Promise<void> {
    this.countriesByIso = await this.countrySrv.getCountriesByISO();

    // Available countries
    this.availableCountriesByISO = [];
    this.up.selectedMasterBox?.countries.map(({ iso }) => {
      this.availableCountriesByISO.push(this.countriesByIso[iso.toLowerCase()]);
    });

    // Sort
    this.availableCountriesByISO = this.upPageSrv.sortCountries(this.availableCountriesByISO);
  }

  /**
   * Set seo
   */
  private async setSeoData(): Promise<void> {
    const defaultLang = this.langSrv.getDefaultLang();

    if (!this.up || !this.farm) {
      return;
    }

    const upType: string = this.up?.upType || UpType.TREE;
    const production = this.up._m_production[this.langSrv.getCurrentLang()] || this.up._m_production.en;

    const seoReplacements = {
      '{publicVariety}': this.up._m_publicVariety[this.langSrv.getCurrentLang()] || this.up._m_publicVariety.en,
      '{farmName}': this.farm._m_name[this.langSrv.getCurrentLang()] || this.farm._m_name.en,
      '{cityfarm}': this.farm.address.city,
      '{countryFarm}':
        this.countriesByIso[this.farm.address.country]?._m_name[this.langSrv.getCurrentLang()] ||
        this.countriesByIso[this.farm.address.country]?._m_name.en,
      '{production}': this.up._m_production[this.langSrv.getCurrentLang()],
      '{productionCapital}': production.charAt(0).toUpperCase() + production.slice(1),
    };

    const link =
      `${this.env.domain}/${this.langSrv.getCurrentLang()}/farmer/` +
        this.farmer.slug +
        '/up/' +
        this.up._m_slug[this.langSrv.getCurrentLang()] || this.up._m_slug.en;

    const params = {
      title: this.textSrv.getText([AUTO_SEO_TITLE, UP, upType].join(' '), seoReplacements),
      description: this.textSrv.getText([AUTO_SEO_DESCRIPTION, UP, upType].join(' '), seoReplacements),
      og: {
        title: this.textSrv.getText([AUTO_SEO_TITLE, UP, upType].join(' '), seoReplacements),
        description: this.textSrv.getText([AUTO_SEO_DESCRIPTION, UP, upType].join(' '), seoReplacements),
        url: link,
        image: [this.up.introPicturesURLs[0], this.farmer.coverURL, this.up.pictureURL, this.farm.pictureURL, this.farmer.bioPictureURL],
        ...(this.farmer?.videoURL && { video: this.farmer.videoURL[defaultLang] }),
      },
    };

    let jsonSeo: any = false;

    try {
      const prices = await this.upPageSrv.getPriceAllCountries(this.up.code);

      const offers = [];

      for (const country of prices) {
        offers.push({
          '@type': 'Offer',
          price: country.price,
          priceCurrency: country.currency,
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
          name: this.farm._m_name[this.langSrv.getCurrentLang()] || this.farm._m_name.en,
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
   * Filters up's tags and seals
   */

  private filterTagsAndSeals(): void {
    const projectSeals = [].concat(this.up.seals).concat(this.farmer.seals).concat(this.farm.seals);

    this.upSeals = this.sealSrv.getCompleteSeals(projectSeals, this.up.featuredSeal);
    this.upTags = this.allTags.filter((e: any) => this.up._tags.includes(e._id));
  }

  /**
   * Concat extra info
   */

  private mergeExtraInfo(): void {
    this.extraInfo = [];
    this.extraInfo = this.extraInfo.concat(this.farmer.extraInfo.concat(this.farm.extraInfo).concat(this.up.extraInfo));
  }

  /**
   * Build object for information on up-card component
   */

  private buildInformationReplacements(): void {
    const farmCountry: any = this.countriesByIso[this.farm.address.country];

    this.upInformationReplacements = {
      '{variety}': this.up.variety,
      '{publicVariety}': this.up.publicVariety,
      '{masterUnitsMax}': this.up.masterUnitsMax,
      '{production}': this.up.production,
      '{farmerName}': this.farmer.name,
      '{farmName}': this.farm.name,
      '{cityfarm}': this.farm.address.city,
      '{countryFarm}': farmCountry.name,
      '{expectedLife}': this.up.expectedLife,
      '{maxCrowdFarmersByItem}': this.up.maxCrowdfarmersByItem,
      '{minStepMS}': this.up.minStepMS,
      '{maxStepMS}': this.up.maxStepMS,
      '{weightUnit}': this.up.masterBoxes[0].weightUnit,
      '{category}': this.up.category,
      '{subcategory}': this.up.subcategory,
      '{up}': this.up.up,
      '{quantityFinalProductTotal}': this.up.quantityFinalProductTotal,
      '{originalProduction}': this.up.originalProduction,
      '{quantityOriginalProduction}': this.up.quantityOriginalProduction,
      '{bioSince}': this.up.bioSince,
      '{demeterSince}': this.up.demeterSince,
      '{completionConversionBio}': this.up.completionConversionBio,
      '{completionConversionDemeter}': this.up.completionConversionDemeter,
      '{adoptedSurface}': this.up.adoptedSurface,
      '{yearCreation}': this.up.yearCreation,
      '{ageUp}': new Date().getFullYear() - this.up.yearCreation,
    };
  }

  /**
   * Open location selector popup
   */
  openLocationSelector(): void {
    this.popoverSrv.open(LOCATION_LANG_POPOVER_REF, HEADER_LOCATION_ID, {
      inputs: {
        countries: this.up.selectedMasterBox?.countries?.map((country: any) => this.countriesByIso[country.iso]),
      },
      outputs: {
        onClose: () => {
          this.popoverSrv.close(LOCATION_LANG_POPOVER_REF);
        },
      },
    });
  }

  /**
   * Season state
   */

  private async calculateSeasonState(): Promise<void> {
    this.ss = {
      endedSeason: false,
      inSeason: false,
      cantSendCountry: false,
      upsAvailable: false,
      ohAvailable: false,
      noDatesLeft: false,
    };

    const today = dayjs(Date.now(), {}).startOf('day');
    const adoptEndDate = dayjs(this.billingSeason.purchaseEndDate, {}).startOf('day');
    const ohPurchaseEndDate = dayjs(this.shippingSeason.shippingEndDate, {}).startOf('day');

    // Can buy OH
    let ohDaysLeft = 0;

    // First, check if OverHarvest is allowed for the up
    if (this.up.overharvestAllowed) {
      const minOH = 1;

      // Second, check if the season has enough OverHarvest units
      if (this.shippingSeason.availableOverHarvest > minOH) {
        const availableOhDates = await this.getOhAvailableDates();

        // Third, check if there are available OverHarvest dates for the selected country
        if (availableOhDates?.length > 0) {
          this.up.masterBox = this.upSrv.getValidMasterBox(this.up, 'OVERHARVEST');
          // today isBefore ohPurchaseEndDate
          ohDaysLeft = ohPurchaseEndDate.diff(today, 'day');
          this.ss.ohAvailable = ohDaysLeft > 0;
        }
      }
    }

    // Flags
    const adoptionDaysLeft = adoptEndDate.diff(today, 'day');
    const canAdopt = adoptionDaysLeft > 0;

    if (!canAdopt && !this.ss.ohAvailable) {
      this.ss.endedSeason = true;
      this.headerBoxesInfo.daysLeft = ohDaysLeft;

      return;
    } else {
      this.ss.inSeason = true;

      // Can't send to that country
      if (!this.availableDates) {
        this.ss.cantSendCountry = true;
      }

      // No dates to send
      if (this.availableDates?.length === 0 && !this.ss.ohAvailable) {
        this.ss.noDatesLeft = true;
      }

      // Dates available
      if (this.availableDates?.length > 0) {
        // Can adopt
        if (this.billingSeason.remainingUnits > 0 && canAdopt) {
          this.ss.upsAvailable = true;
          // UU
          if (this.isUberUp) {
            this.up.uberUps = this.up.uberUps.filter((uberUp: any) => uberUp.usedShares >= 0);

            if (this.up.uberUps.length > 0) {
              this.uberUpSelected = this.up.uberUps[0];
            } else {
              this.ss.upsAvailable = false;
            }
          }
        }
      }
      this.headerBoxesInfo.daysLeft = adoptionDaysLeft;
      this.headerBoxesInfo.nextDelivery = this.availableDates?.length > 0 ? this.availableDates[0] : null;
      if (this.billingSeason.remainingUnits > 0) {
        this.headerBoxesInfo.remainingUnits = this.billingSeason.remainingUnits;
      }
    }
  }

  /**
   * Get oh available shipping dates
   */
  async getOhAvailableDates(): Promise<string[]> {
    try {
      return await this.calendarSrv.getAvailableDates(this.location, {
        type: OVERHARVEST.toUpperCase(),
        masterBox: this.upSrv.getValidMasterBox(this.up, 'OVERHARVEST')._id,
        up: this.up,
        ...{ stepMS: this.up.minStepMS },
      });
    } catch (e) {
      return null;
    }
  }

  changeOption(clickedOption: number): void {
    this.menuOptions.filter((e, i) => {
      e.clicked = clickedOption === i;
    });
    this.selectedOption = this.menuOptions[clickedOption].name.toLowerCase();
    if (clickedOption === 0) {
      this.popoverSrv.open(ACCORDION_POPOVER_REF, OPTIONS_BAR_ID, {
        inputs: {
          selected: this.selectedSection,
          sections: [UpSections.theProject, UpSections.whatAdopt, UpSections.whatReceive, UpSections.whenReceiveIt, UpSections.whyAdopt],
        },
        outputs: {
          onClose: (selected) => {
            if (selected) {
              this.selectedSection = selected.selectedSection;

              const space = this.stateSrv.showGreenBanner ? 140 : 100;

              this.domSrv.scrollToElmWithHeader('#' + this.utilsSrv.fromCamelCaseToDased(this.selectedSection), space);
            }
            this.popoverSrv.close(ACCORDION_POPOVER_REF);
            this.isOpenSectionsPopover = false;
          },
        },
      });
      this.isOpenSectionsPopover = true;
    } else {
      const space = this.stateSrv.showGreenBanner ? 140 : 90;

      this.domSrv.scrollTo(UP_CONTENT_SELECTOR, space, true);
    }
  }

  loadSubscribePopOver(): void {
    if (this.popoverListenerToBeLaunched) {
      this.popoverSrv.setIfShowSubscribeNewsletter();
      this.popoverListenerToBeLaunched = false;
    }
  }

  triggerToggleUpCardMobile(event: boolean): void {
    this.showUpCardMobile = event;
    if (this.showUpCardMobile) {
      this.domSrv.addClasses('body', ['no-scroll']);
    } else {
      this.domSrv.removeClasses('body', ['no-scroll']);
    }

    setTimeout(() => {
      this.animateUpCardMobile = event;
    }, ANIMATE_UP_CARD_MOBILE_TIMER);
  }

  fixMenu(): void {
    this.fixedMenu = this.domSrv.scrollUnderOverElement(UP_CONTENT_SELECTOR, 150, false, true, true);
  }
}
