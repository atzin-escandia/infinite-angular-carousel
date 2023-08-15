import { Component, Input, OnInit } from '@angular/core';
import { FarmersMarketService } from '@modules/farmers-market/farmers-market.service';
import { CardService } from '@modules/farmers-market/services/card.service';
import {
  CountryService,
  DomService,
  LangService,
  RouterService,
  StateService,
  TrackingConstants,
  TrackingGA4Prefixes,
  TrackingService,
} from '@app/services';
import { AgroupmentService } from '@services/agroupments';
import { SealsService } from '@pages/farmer/services/seals';
import { PROJECT_CARD_SIZE, PROJECT_TYPE, ProjectsByAgroup } from '@constants/landing.constants';
import { DsAdoptionCardComponent, DsOhCardComponent } from '@crowdfarming/ds-library';
import { CFCurrencyPipe } from '@pipes/currency';
import { IEcommerceTracking, UnknownObjectType } from '@app/interfaces';
import { ProjectsResource } from '@app/resources';
import { LandingsService } from '@app/services/landing';
import { OVERHARVEST } from '@app/pages/farmer/overharvest/constants/overharvest.constants';
import { Subject, tap } from 'rxjs';
import { FavouritesSection } from '@interfaces/favourites.interface';

@Component({
  selector: 'landing-agroupment',
  templateUrl: './landing-agroupment.component.html',
  styleUrls: ['./landing-agroupment.component.scss'],
})
export class LandingAgroupmentComponent implements OnInit {
  @Input() id: string;
  @Input() title: string;
  @Input() option: number;
  @Input() isHome: boolean;
  @Input() info: any;

  PROJECT_TYPE = PROJECT_TYPE;
  agroupment: UnknownObjectType;
  type: string;
  currentCountry: string;
  currentLang: string;
  currentLangSubscription: UnknownObjectType;
  isLoading: boolean;
  component: any;
  data = [];
  styles = ['col-12', 'col-sm-6', 'py-12'];
  landingKey = FavouritesSection.LANDING;
  dummySkeleton = {
    adoptions: [1, 2, 3],
    boxes: [1, 2, 3, 4],
  };
  isMobile: boolean;
  cardsToShow: number;
  scrollSubject$ = new Subject<void>();

  changeCountry$ = this.countrySrv.countryChange().pipe(
    tap((countryIso) => {
      this.currentCountry = countryIso;
      void this.getAgroupment();
    })
  );

  constructor(
    public cardSrv: CardService,
    public domSrv: DomService,
    public farmersMarketSrv: FarmersMarketService,
    public routerSrv: RouterService,
    public stateSrv: StateService,
    public agroupmentSrv: AgroupmentService,
    public sealSrv: SealsService,
    public currencyPipeSrv: CFCurrencyPipe,
    private langSrv: LangService,
    private countrySrv: CountryService,
    private projectsRsc: ProjectsResource,
    private landingSrv: LandingsService,
    private trackingSrv: TrackingService,
  ) {
    this.changeCountry$.subscribe();
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.isMobile = this.domSrv.getIsDeviceSize();
    this.currentCountry = this.countrySrv.getCountry();
    this.currentLang = this.langSrv.getCurrentLang();
    void this.getAgroupment();
    this.info = {
      ...this.info,
      ...{ variant: 'secondary', width: 'full', size: 'm', inverse: false },
    };
  }

  async getAgroupment(): Promise<void> {
    this.agroupment = await this.projectsRsc.getAgroupmentsById(this.id, {
      country: this.currentCountry,
      limit: ProjectsByAgroup.AGROUPMENT_LONG_LENGTH,
    });
    this.type = this.agroupment.type[0] === 'adoption' ? PROJECT_TYPE.ADOPTIONS : PROJECT_TYPE.BOXES;
    this.cardsToShow = this.getItemsToShow(); // Check total number of items in rows
    this.type === PROJECT_TYPE.BOXES && this.cardSrv.setDefaultMasterBox(this.agroupment.projects);
    this.setMbOptions();
    await this.setProjectSeals();
    this.trackGA4();

    this.isLoading = false;
    this.setDataAgroupment();
  }

  getTotalCardNumber(): number {
    const cardsNumber = this.type === 'adoptions' ? 3 : 4;
    const desktopCardNumber =
      this.type === PROJECT_TYPE.BOXES ? ProjectsByAgroup.AGROUPMENT_LONG_LENGTH : ProjectsByAgroup.AGROUPMENT_SHORT_LENGTH;

    return Math.floor(desktopCardNumber / cardsNumber) * cardsNumber;
  }

  getItemsToShow(): number {
    return this.isMobile ? this.agroupment.projects.length : this.getTotalCardNumber();
  }

  async setProjectSeals(): Promise<void> {
    await this.sealSrv.setAllSeals();

    this.agroupment.projects.map((project) => {
      project.upSeals = this.sealSrv.getCompleteSeals(project.up?.seals, project.up?.featuredSeal);
    });
  }

  setMbOptions(): void {
    this.agroupment.projects.forEach((project) => {
      project.mbsInfo = this.cardSrv.getMbsInfo(project.filters?.masterBoxes);
      project.options = this.cardSrv.setDiscount(project.mbsInfo, project.filters.masterBoxes);
    });
  }

  isAgroupmentShow(): boolean {
    const minNumberProjects = this.type === PROJECT_TYPE.ADOPTIONS ? PROJECT_CARD_SIZE.ADOPTIONS_LENGTH : PROJECT_CARD_SIZE.BOXES_LENGTH;

    return this.agroupment?.projects.length && this.agroupment?.projects.length >= minNumberProjects;
  }

  handleScrollEvent(): void {
    this.scrollSubject$.next();
  }

  setDataAgroupment(): void {
    this.data = [];
    this.styles.push(this.type === PROJECT_TYPE.BOXES ? 'col-lg-3' : 'col-lg-4');
    this.component = this.type === PROJECT_TYPE.BOXES ? DsOhCardComponent : DsAdoptionCardComponent;
    this.agroupment.projects.map((project, i) => {
      i < this.cardsToShow &&
        (this.type === PROJECT_TYPE.BOXES ? this.setProjectDataOH(project, i) : this.setProjectDataAdoption(project, i));
    });
    this.isLoading = true;
  }

  handleEventData(data: any): void {
    const agroupmentEnglishTitle = this.agroupment._m_title?.[TrackingConstants.DEFAULT_TRACKING_LANGUAGE];

    // Set here all functions to handle from dynamic component grid
    const { eventData, key, index } = data;
    const dynamicFunctions = {
      toggleChange: () => {
        const activeMB = this.cardSrv.getActiveMasterBox(this.agroupment.projects[index], eventData);

        this.data[index].selectedOption = eventData;
        this.data[index].price = this.currencyPipeSrv.transform(activeMB.ohPrice.amount);
        this.data[index].selectedMb = activeMB;
      },
      emitButtonClick: () => {
        eventData.preventDefault();
        const itemToCart = {
          ...this.agroupment.projects[index],
          selectedMb: this.data[index].selectedMb,
        };

        this.agroupmentSrv.addToCart(itemToCart, index, false, this.type, agroupmentEnglishTitle);
      },
      cardClick: () => {

        this.cardSrv.navigateToDetail(this.agroupment.projects[index]);
        this.agroupmentSrv.trackClickPromotion(this.agroupment.projects[index], index, this.type, agroupmentEnglishTitle);
      },
    };

    dynamicFunctions[key]();
  }

  setProjectDataAdoption(item: any, index: number): void {
    this.data[index] = this.agroupmentSrv.setProjectDataAdoption(item);
  }

  setProjectDataOH(item: any, index: number, eventData?: any): void {
    item.selectedOption = eventData;
    this.data[index] = this.agroupmentSrv.setProjectDataOH(item);
  }

  private trackGA4(): void {
    if (!this.isAgroupmentShow()) { return; }

    const LANDING_ID: string = this.landingSrv.getCurrentLandingEnglishCode();
    const items = [];
    const listName = this.trackingSrv.buildListName(this.agroupment._m_title?.en, `${TrackingGA4Prefixes.MARKETING_LANDING}${LANDING_ID}/`);

    for ( const [i, e] of this.agroupment.projects.entries() ) {
      // TODO: fill in with IEcommerceTracking
      items.push({
        index: i + 1,
        item_brand: e.farm?._m_name?.en,
        currency: e.filters?.price?.currency?.crowdfarmer?.currency,
        price: this.agroupment?.type?.includes(OVERHARVEST) ? e.filters?.ohPrice?.amount : e.filters?.price?.amount,
        item_variant: this.agroupment?.type?.includes(OVERHARVEST)
          ? TrackingConstants.ITEM_VARIANT.OH
          : TrackingConstants.ITEM_VARIANT.ADOPT,
        quantity: 1,
        item_id: e.up?.id,
        item_category: e.up?.categoryName,
        item_category2: e.up?.subcategoryName,
        item_category3: e.up?._m_variety?.en,
        item_category4: e.up?.subvariety,
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

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.VIEW_ITEM_LIST, true, { items });
  }
}
