import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICountry, UnknownObjectType } from '@app/interfaces';
import {
  CountryService,
  LangService,
  LoggerService,
  RouterService,
  SeoService,
  StorageService,
  TrackingConstants,
  TrackingService,
  UpService,
} from '@app/services';
import { Filters } from '@enums/filters.enum';
import { FarmersMarketService } from '@modules/farmers-market/farmers-market.service';
import { BasePageComponent } from '@modules/farmers-market/pages/base/base.page';
import { PAGE_TYPES, Page } from '@modules/farmers-market/types/page.types';
import { TranslocoService } from '@ngneat/transloco';
import { SearchService } from '@services/search';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, first, takeUntil, tap } from 'rxjs/operators';
import { FILTERS_KEY, FILTERS_SETUP, SORTING_FILTERS } from '../../constants/filters.constants';
import { CardService } from '../../services/card.service';

@Component({
  selector: 'search-results-page',
  templateUrl: './search-results.page.html',
  styleUrls: ['./search-results.page.scss'],
})
export class SearchResultsPageComponent extends BasePageComponent implements OnInit, OnDestroy {
  tabs = [
    {
      id: 'adoptions',
      key: 'global.adoptions.button',
    },
    {
      id: 'boxes',
      key: 'global.boxes.button',
    },
    {
      id: 'all',
      key: 'global.all.button',
    },
  ];
  currentTab: number;
  currentIdPage: string;
  selectedFilters = {
    categories: [],
    countries: [],
    seals: [],
    subcategories: [],
  };

  countriesByIso: { [iso: string]: ICountry } = {};
  filters = FILTERS_SETUP;
  currentLang: string;
  currentCountry: string;
  indexPage: number;
  categoriesFormatted = [];
  sealsFormatted = [];
  filtersSetUp = FILTERS_SETUP;
  isFirstLoad = true;
  isFiltersActive = false;
  hasResults = false;
  ga4_categories: UnknownObjectType;
  private countrySubscription = new Subscription();

  currentLang$ = this.langSrv.getCurrent();
  public destroy$ = new Subject<void>();

  changeLang$ = this.currentLang$.pipe(
    debounceTime(500),
    tap((lang) => {
      this.currentLang = lang;
    })
  );

  constructor(
    public loggerSrv: LoggerService,
    public farmersMarketSrv: FarmersMarketService,
    private searchSrv: SearchService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    private routerSrv: RouterService,
    public storageSrv: StorageService,
    public langSrv: LangService,
    public translocoSrv: TranslocoService,
    public seoSrv: SeoService,
    public countrySrv: CountryService,
    public cardSrv: CardService,
    public location: Location,

    private trackingSrv: TrackingService,
    private upSrv: UpService
  ) {
    super(loggerSrv, farmersMarketSrv, activatedRoute, seoSrv, router, langSrv, countrySrv, cardSrv);
    this.type = (this.activatedRoute.snapshot.queryParamMap.get('tab') || 'all') as Page;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.currentLang = this.langSrv.getCurrentLang();
    this.changeLang$.pipe(takeUntil(this.destroy$)).subscribe();

    void this.setSelectedFilters();
    this.currentTab = this.tabs.findIndex((tab) => tab.id === this.type);
    this.currentIdPage = this.tabs[this.currentTab].id;
    this.searchSrv.searchOpen = true;

    this.route.queryParams.subscribe(async (params) => {
      this.farmersMarketSrv.setCurrentPages();
      await this.setSelectedFilters();
      this.isFiltersActive =
        (this.selectedFilters.categories.length ||
          this.selectedFilters.seals.length ||
          this.selectedFilters.countries.length ||
          this.selectedFilters.subcategories.length) > 0;

      const search = params.q || '';
      const queryParamsCode = this.farmersMarketSrv.getParamsFromReq(params, this.route.snapshot.params.lang);

      const sort = this.farmersMarketSrv.getSortingKey();

      await this.farmersMarketSrv.getAllProjects(this.type, search, { ...queryParamsCode, sort });
      this.hasResults = (this.farmersMarketSrv.projects.adoptions.length || this.farmersMarketSrv.projects.boxes.length) > 0;

      this.hasResults
        ? this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.SEARCH_OK)
        : this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.SEARCH_KO);

      this.trackSearchResult();
    });

    this.countrySrv
      .getCountriesLoaded()
      .pipe(first((val) => !!val))
      .subscribe(() => {
        this.countrySubscription = this.countrySrv.countryChange().subscribe(() => {
          if (!this.isFirstLoad) {
            this.farmersMarketSrv.setSortingKey(SORTING_FILTERS.relevance.id);
            void this.farmersMarketSrv.getAllProjects(this.type, '', {});
            const urlTree = this.router.createUrlTree([], {
              relativeTo: this.route,
              queryParams: { tab: this.tabs[this.currentTab].id },
            });

            this.selectedFilters = this.storageSrv.get('CURRENT_FILTERS');

            this.location.go(urlTree.toString());
          }
        });
      });

    this.isFirstLoad = false;
  }

  ngOnDestroy(): void {
    this.countrySubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  async changeTab(index: number): Promise<void> {
    this.type = this.tabs[index].id as Page;
    this.currentIdPage = this.tabs[index].id;
    this.currentTab = index;

    const filterParams = this.getFilterParams();

    const getQuerySearch = this.route.snapshot.queryParams.q;
    const sort = this.farmersMarketSrv.getSortingKey();

    await this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: getQuerySearch, tab: this.tabs[index].id, sort, ...filterParams },
    });
    this.trackSearchResult();
  }

  async removeSelectedFilter(filterSection: string, filter: string): Promise<void> {
    let remainingFilters;
    let filtersParams;

    switch (filterSection) {
      case 'countries':
        remainingFilters = this.selectedFilters.countries.filter((selectedFilterCountry) => selectedFilterCountry !== filter);
        filtersParams = Object.values(this.countriesByIso)
          .filter((country) =>
            remainingFilters.some(
              (remainingCountry) => remainingCountry === this.farmersMarketSrv.formatIdParam(country._m_name[this.currentLang])
            )
          )
          .map((c) => c.iso)
          .join(',');
        break;
      case 'categories':
      case 'subcategories':
      case 'seals':
        remainingFilters = this.selectedFilters?.[filterSection].filter(
          (selectedFilterCountry) => selectedFilterCountry !== this.farmersMarketSrv.formatIdParam(filter)
        );
        filtersParams = Object.values(this.filtersSetUp?.[filterSection])
          .filter(
            (category: any) =>
              this.farmersMarketSrv.formatIdParam(category._m_name[this.currentLang]) !== filter &&
              this.selectedFilters?.[filterSection].includes(this.farmersMarketSrv.formatIdParam(category._m_name[this.currentLang]))
          )
          .map((c: any) => this.farmersMarketSrv.formatIdParam(c._m_name[this.currentLang]))
          .join(',');
        break;
    }

    this.routerSrv.navigate('search', null, {
      ...this.activatedRoute.snapshot.queryParams,
      [filterSection]: filtersParams.length ? filtersParams : null,
    });

    const currentFilter = filterSection === 'countries' ? filter : this.farmersMarketSrv.formatIdParam(filter);

    this.selectedFilters[filterSection] = this.selectedFilters[filterSection]?.filter((selected) => selected !== currentFilter);
    await this.farmersMarketSrv.setProjectsByPage({ page: 1, 'filters[farmers]': filtersParams }, true);
    await this.setSelectedFilters();
  }

  async initFilters(): Promise<void> {
    this.filtersSetUp = this.storageSrv.get(FILTERS_KEY);

    if (!this.filtersSetUp) {
      this.filters = this.filtersSetUp = await this.farmersMarketSrv.getFiltersCriteria();
    }
    this.ga4_categories = this.ga4_categories || (await this.upSrv.getCategories());
  }

  formatFilter(filter: string, group: string): string {
    let nameFilter;

    this.filtersSetUp[group].forEach((a: any) => {
      this.farmersMarketSrv.formatIdParam(a._m_name[this.currentLang]) === filter && (nameFilter = a._m_name[this.currentLang]);
    });

    return nameFilter;
  }

  async setSelectedFilters(): Promise<void> {
    await this.initFilters();
    const { categories, countries, seals, subcategories } = this.activatedRoute.snapshot.queryParams;

    this.filters.countries.forEach((country) => {
      this.countriesByIso[country.iso] = country;
    });
    this.selectedFilters.categories = categories?.split(',') || [];
    this.selectedFilters.seals = seals?.split(',') || [];
    this.selectedFilters.countries = [];
    this.selectedFilters.subcategories = subcategories?.split(',') || [];

    countries &&
      (this.selectedFilters.countries = this.filtersSetUp?.countries
        .filter((a) => countries.includes(a.iso))
        .map((c) => this.farmersMarketSrv.formatIdParam(c._m_name[this.currentLang])));

    this.farmersMarketSrv.setCurrentFiltersKey(this.selectedFilters);
  }

  getFilterParams(): UnknownObjectType {
    const params = {};

    Object.keys(this.selectedFilters).forEach((group) => {
      const stringIds = this.selectedFilters[group].map((id) =>
        group === Filters.categories || group === Filters.seals
          ? id
          : this.filtersSetUp.countries.find((country) => this.farmersMarketSrv.formatIdParam(country._m_name[this.currentLang]) === id).iso
      );

      if (this.selectedFilters[group].length) {
        params[group] = stringIds.join(',');
      }
    });

    return params;
  }

  private isSearchFilterApplied(): boolean {
    return (
      this.selectedFilters?.categories?.length > 1 || this.selectedFilters?.countries?.length > 0 || this.selectedFilters?.seals?.length > 0
    );
  }

  private isSearchCategoryFilterAppliedToOnlyOne(): boolean {
    return (
      this.selectedFilters?.categories?.length === 1 &&
      !(this.selectedFilters?.countries?.length > 0) &&
      !(this.selectedFilters?.seals?.length > 0)
    );
  }

  private trackSearchResult(): void {
    const customEventData = {
      cf_page_title: '',
      page_type: '',
      language: this.langSrv.getCurrentLang(),
      country_delivery: this.countrySrv.getCurrentCountry()?.iso,
    };

    const SEARCH_SUFFIX = this.isSearchFilterApplied() ? TrackingConstants.GTM4.CF_PAGE_TITLE.SEARCH_FILTERS_RESULTS_SUFFIX : '';

    if (this.hasResults) {
      customEventData.page_type = TrackingConstants.GTM4.PAGE_TYPE.SEARCH_RESULTS_OK;
      switch (this.type) {
        case PAGE_TYPES.ADOPTIONS:
          customEventData.cf_page_title = TrackingConstants.GTM4.CF_PAGE_TITLE.SEARCH_RESULTS_OK_ADOPTIONS + SEARCH_SUFFIX;
          break;
        case PAGE_TYPES.BOXES:
          customEventData.cf_page_title = TrackingConstants.GTM4.CF_PAGE_TITLE.SEARCH_RESULTS_OK_OH + SEARCH_SUFFIX;
          break;
        case PAGE_TYPES.ALL:
        default:
          customEventData.cf_page_title = TrackingConstants.GTM4.CF_PAGE_TITLE.SEARCH_RESULTS_OK_ALL + SEARCH_SUFFIX;
          break;
      }
    } else {
      customEventData.page_type = TrackingConstants.GTM4.PAGE_TYPE.SEARCH_RESULTS_KO;
      switch (this.type) {
        case PAGE_TYPES.ADOPTIONS:
          customEventData.cf_page_title = TrackingConstants.GTM4.CF_PAGE_TITLE.SEARCH_RESULTS_KO_ADOPTIONS + SEARCH_SUFFIX;
          break;
        case PAGE_TYPES.BOXES:
          customEventData.cf_page_title = TrackingConstants.GTM4.CF_PAGE_TITLE.SEARCH_RESULTS_KO_OH + SEARCH_SUFFIX;
          break;
        case PAGE_TYPES.ALL:
        default:
          customEventData.cf_page_title = TrackingConstants.GTM4.CF_PAGE_TITLE.SEARCH_RESULTS_KO_ALL + SEARCH_SUFFIX;
          break;
      }
    }

    if (this.isSearchCategoryFilterAppliedToOnlyOne()) {
      const selectedCategory = this.selectedFilters?.categories[0];
      const categoryCode = this.ga4_categories.find(
        (x) => this.farmersMarketSrv.formatIdParam(x._m_name[this.currentLang]) === selectedCategory
      )?.code;
      const CATEGORY_FILTER_APPLIED = categoryCode ? TrackingConstants.GTM4.CATEGORY_CODE_EN_NAME_MAPPING[categoryCode] : '';

      customEventData.page_type = TrackingConstants.GTM4.PAGE_TYPE.SEARCH_FILTERS_ONE_CATEGORY;
      customEventData.cf_page_title = TrackingConstants.GTM4.CF_PAGE_TITLE.SEARCH_FILTERS_ONE_CATEGORY_PREFIX + CATEGORY_FILTER_APPLIED;
    }

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PAGE_VIEW, false, customEventData);
  }
}
