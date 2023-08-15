import { Component, OnInit, Injector, Input, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BaseComponent } from '@components/base';
import {
  CountryService,
  UserService,
  AuthService,
  RouterService,
  ProjectsService,
  TrackingService,
  TrackingConstants,
  TrackingGA4Prefixes,
} from '@app/services';
import { ICountry, IEcommerceTracking } from '@app/interfaces';
import { SealsService } from '@pages/farmer/services/seals';
import { OVERHARVEST } from '@app/pages/farmer/overharvest/constants/overharvest.constants';

@Component({
  selector: 'home-projects-block',
  templateUrl: './projects-block.component.html',
  styleUrls: ['./projects-block.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProjectsBlockComponent extends BaseComponent implements OnInit, OnDestroy {
  public rawCountries: ICountry[];
  public agroupments: any[] = [];
  public countrySelected: ICountry;
  public langSubs: Subscription;
  public countrySubscription: Subscription;
  public currentLang: string;
  public isLoading = false;
  public displayAgroupmentBlock = true;
  // Carousel - slider
  public allAgrup = [];

  @Input() inheritedLang: string;
  @Input() inheritedAgroupments: any;
  // This input is provisional, once new one was the only one, We can delete it.
  @Input() isNewHome = false;

  constructor(
    public injector: Injector,
    public countrySrv: CountryService,
    public userSrv: UserService,
    public projectsSrv: ProjectsService,
    public authSrv: AuthService,
    public routerSrv: RouterService,
    public sealsSrv: SealsService,
    private trackingSrv: TrackingService
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    this.currentLang = this.inheritedLang || this.langSrv.getCurrentLang();

    await this.sealsSrv.setAllSeals();

    await this.buildCountriesObject();

    this.countrySelected = this.getCountryByIso(this.countrySrv.getCountry())[0];

    if (this.domSrv.isPlatformBrowser()) {
      this.createSubscriptions();
    }

    if (!this.agroupments.length) {
      try {
        this.isLoading = true;
        await this.getAgroupmentsData();
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  /**
   * restart info on resize events
   */
  public sizeConfig(): void {
    this.agroupments = [];

    setTimeout(() => {
      void this.getAgroupmentsData(false);
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.langSubs) {
      this.langSubs.unsubscribe();
    }
    if (this.countrySubscription) {
      this.countrySubscription.unsubscribe();
    }
  }

  createSubscriptions(): void {
    this.langSubs = this.langSrv.getCurrent().subscribe(async (lang): Promise<void> => {
      this.currentLang = lang;
      await this.buildCountriesObject();
    });

    this.countrySubscription = this.countrySrv.countryChange().subscribe((country): void => {
      const countryByIso = this.getCountryByIso(country)[0];

      if (this.countrySelected !== countryByIso) {
        this.countrySelected = countryByIso;
        void this.getAgroupmentsData();
      }
    });
  }

  /**
   * Filter country by iso
   *
   * @param iso country iso
   */
  public getCountryByIso(iso: string): ICountry[] {
    return this.rawCountries.filter((country) => country.iso === iso);
  }

  /**
   * Order countrys and get names
   */
  private async buildCountriesObject(): Promise<void> {
    this.rawCountries = await this.countrySrv.get();
    this.rawCountries.sort((a, b) => {
      const x = a.name.toLowerCase();
      const y = b.name.toLowerCase();

      return x < y ? -1 : x > y ? 1 : 0;
    });
  }

  /**
   * Load Agroupments
   */
  public async getAgroupmentsData(callWithoutCountry = false): Promise<void> {
    const MIN_PROJECTS_IN_AGROUPMENT = 3;
    const params: {
      country?: string;
    } = {};
    let agroupmentsToShow = [];

    if (this.countrySelected?.iso && !callWithoutCountry) {
      params.country = this.countrySelected.iso;
    }

    this.agroupments = this.inheritedAgroupments ? [await this.inheritedAgroupments] : await this.projectsSrv.getAgroupments(params);

    this.allAgrup = this.agroupments.map((agroup) => ({
      id: agroup._id,
      counter: 0,
    }));

    // Only when displayAgroupmentBlock is true they're shown and there should be at least MIN_PROJECTS_IN_AGROUPMENT
    agroupmentsToShow = this.agroupments.filter((agroup) => agroup.projects?.length >= MIN_PROJECTS_IN_AGROUPMENT);
    this.displayAgroupmentBlock = agroupmentsToShow?.length > 0;

    if (this.displayAgroupmentBlock) {
      let impressions = [];
      let items = [];

      agroupmentsToShow.forEach((agroup) => {
        impressions = [];
        for (const [i, e] of agroup.projects.entries()) {
          impressions.push({
            name: e.code,
            list: agroup._m_title?.en,
            id: e.up?.id,
            category: e.up?.category,
            brand: e.farmer?.brandName,
            position: i + 1,
          });
        }
        items = [];

        for (const [i, e] of agroup.projects.entries()) {
          const listName = this.trackingSrv.buildListName(agroup._m_title?.en, TrackingGA4Prefixes.HOME);

          // TODO: fill in with IEcommerceTracking
          items.push({
            index: i + 1,
            item_brand: e.farm?._m_name?.en,
            currency: this.countrySelected?.currency,
            price: agroup.type?.includes(OVERHARVEST) ? e.filters?.ohPrice?.amount : e.filters?.price?.amount,
            item_variant: agroup.type?.includes(OVERHARVEST) ? TrackingConstants.ITEM_VARIANT.OH : TrackingConstants.ITEM_VARIANT.ADOPT,
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

        this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.IMPRESSION, true, { impressions });
        this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.VIEW_ITEM_LIST, true, { items });
      });
    }
  }
}
