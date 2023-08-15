import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import {
  AuthService,
  CountryService,
  DomService,
  FavouriteService,
  LangService,
  RouterService,
  StorageService,
  TrackingConstants,
  TrackingService,
} from '@app/services';
import { LOCAL_STORAGE_FAVORITE_KEY } from '@interfaces/favourites.interface';
import { Subject, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PAGE_TYPES, Page } from '@modules/farmers-market/types/page.types';
import { TranslocoService } from '@ngneat/transloco';
import { FarmersMarketService } from '@modules/farmers-market/farmers-market.service';
import { IEcommerceTracking, IMultilingual, UnknownObjectType, ICountry } from '@app/interfaces';
import { Filters, TrackingGA4ImpressionIds, TrackingImpressionIds } from '@enums/filters.enum';
import { FILTERS_KEY } from '../../constants/filters.constants';
import { QueryParams } from '../../interfaces/query-params.interface';
import { CardService } from '../../services/card.service';

@Component({
  selector: 'catalogue',
  template: '',
  styleUrls: ['./catalogue.component.scss'],
})
export class CatalogueComponent implements OnInit, OnChanges, OnDestroy {
  @Input() projects: any[];
  @Input() title: string;
  @Input() type: Page = PAGE_TYPES.ALL;
  @Input() searchPath: string;
  @Input() showFiltersButtons = false;

  currentLangSubscription: any;
  currentLang: string;
  currentCountry: ICountry;
  isGiftActive: boolean;
  private countrySubscription: Subscription;
  private currentPaginationPages = { adoptions: 1, boxes: 1 };
  public scrollSubject$ = new Subject<void>();
  public destroy$ = new Subject<void>();

  constructor(
    public translocoSrv: TranslocoService,
    public langSrv: LangService,
    public routerSrv: RouterService,
    public route: ActivatedRoute,
    public router: Router,
    public location: Location,
    public farmersMarketSrv: FarmersMarketService,
    public countrySrv: CountryService,
    public cardSrv: CardService,
    public domSrv: DomService,
    public storageSrv: StorageService,
    public trackingSrv: TrackingService,
    public favouriteSrv: FavouriteService,
    public authSrv: AuthService,
  ) {}

  handleCardClick(project: UnknownObjectType, index: number): void {
    this.cardSrv.navigateToDetail(project, this.type);
    this.trackClickPromotion(project, index);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.projects?.currentValue?.length && !changes.projects.firstChange) {
      this.currentPaginationPages = this.farmersMarketSrv.getCurrentPages();
      this.trackImpressions(this.projects);
      this.trackingSrv.setTradeDoublerProjects(changes.projects.currentValue);
    }
  }

  ngOnInit(): void {
    this.currentCountry = this.countrySrv.getCurrentCountry();
    this.currentLang = this.langSrv.getCurrentLang();
    this.cardSrv.setCountryAndLang(this.currentCountry?.iso, this.currentLang);

    this.currentLangSubscription = this.langSrv.getCurrent().subscribe((lang) => {
      this.cardSrv.setCountryAndLang(this.currentCountry?.iso, lang);
      this.currentLang = lang;
    });

    this.countrySrv
      .getCountriesLoaded()
      .pipe(first((val) => !!val))
      .subscribe(() => {
        this.currentCountry = this.countrySrv.getCurrentCountry();

        this.countrySubscription = this.countrySrv.countryChange().subscribe(() => {
          this.currentCountry = this.countrySrv.getCurrentCountry();
          this.cardSrv.setCountryAndLang(this.currentCountry?.iso, this.currentLang);
        });
      });

    this.currentPaginationPages = this.farmersMarketSrv.getCurrentPages();

    this.favouriteSrv.setCrowdfarmer();

    this.storageSrv.get(LOCAL_STORAGE_FAVORITE_KEY) && this.authSrv.isLogged() && this.favouriteSrv.handleSavedFavourite(true);

    this.domSrv.scrollSubject$.next();
  }

  async setCurrentFilters(): Promise<any> {
    const currentFilters = this.farmersMarketSrv.getCurrentFiltersKey();
    let filtersIds = {};

    if (currentFilters) {
      const filtersObject = await this.getFilterParams(currentFilters);

      filtersIds = this.farmersMarketSrv.getParamsFromReq(filtersObject, this.langSrv.getCurrentLang());
    }

    return filtersIds;
  }

  async changePage(page: number, typeClicked: Page): Promise<void> {
    this.currentPaginationPages[this.type] = page;
    this.domSrv.scrollTo(`#catalogue-container-${typeClicked}`, -150);

    let { adoptions, boxes } = this.farmersMarketSrv.getCurrentPages();

    if (typeClicked === PAGE_TYPES.BOXES) {
      boxes = page;
    } else {
      adoptions = page;
    }

    this.farmersMarketSrv.setCurrentPages({ adoptions, boxes });
    const queryParams: QueryParams = {};

    boxes !== 1 && (queryParams.boxesPage = boxes);
    adoptions !== 1 && (queryParams.adoptionsPage = adoptions);

    queryParams.sort = this.farmersMarketSrv.getSortingKey();

    const filtersIds = await this.setCurrentFilters();

    const search = this.route.snapshot.queryParamMap.get('q') || '';

    await this.farmersMarketSrv.setProjectsByPage({ page, sort: queryParams.sort, ...filtersIds, search }, this.type === PAGE_TYPES.BOXES);

    const urlTree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });

    this.location.go(urlTree.toString());
  }

  async getFilterParams(filters: any): Promise<any> {
    const params = {};

    let filtersSetUp = this.storageSrv.get(FILTERS_KEY);

    if (!filtersSetUp) {
      filtersSetUp = await this.farmersMarketSrv.getFiltersCriteria();
    }

    Object.keys(filters).forEach((group) => {
      const stringIds = filters[group].map((id) =>
        group === Filters.categories || group === Filters.seals
          ? id
          : filtersSetUp?.countries.find((country) => this.farmersMarketSrv.formatIdParam(country._m_name[this.currentLang]) === id).iso
      );

      if (filters[group].length) {
        params[group] = stringIds.join(',');
      }
    });

    return params;
  }

  trackImpressions(projects: any[]): void {
    if (!this.type || !projects || !(projects.length > 0)) {
      return;
    }
    const impressions = [];
    const items: IEcommerceTracking[] = [];
    const pageSize = this.farmersMarketSrv.getPageSize();
    const list = this.setTrackingIdImpressions();
    const listName = this.setTrackingGA4IdImpressions();

    this.projects = projects;

    for (const [i, e] of projects.entries()) {
      const PRODUCT_CODE = e.code;

      impressions.push({
        name: PRODUCT_CODE,
        list,
        id: e.up?.id,
        category: e.up?._m_up[this.langSrv.getCurrentLang()],
        brand: e.farmer?.brandName,
        // set position relative to page
        position: i + 1 + pageSize * (this.currentPaginationPages[this.type] - 1),
      });

      // TODO: fill in with IEcommerceTracking
      items.push({
        index: i + 1 + pageSize * (this.currentPaginationPages[this.type] - 1),
        item_brand: e.farm?._m_name?.en,
        currency: this.currentCountry?.currency,
        price: e.overharvest ? e.filters?.ohPrice?.amount : e.filters?.price?.amount,
        item_variant: e.overharvest ? TrackingConstants.ITEM_VARIANT.OH : TrackingConstants.ITEM_VARIANT.ADOPT,
        quantity: 1,
        item_id: e.up?.id,
        item_category: e.up?.categoryName,
        item_category2: e.up?.subcategoryName,
        item_category3: e.up?._m_variety?.en,
        item_category4: e.up?.subvariety,
        item_list_name: listName,
        // Add /Boxes or /Adoptions when listName is /All/...
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
    }
    this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.IMPRESSION, true, { impressions });
    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.VIEW_ITEM_LIST, true, { items });
  }

  setTrackingIdImpressions(): string {
    let list: string;

    if (this.type === PAGE_TYPES.ADOPTIONS) {
      list = this.searchPath ? TrackingImpressionIds.SEARCH_RESULTS_ADOPT : TrackingImpressionIds.FARMERS_MARKET_ADOPTIONS;
    } else {
      list = this.searchPath ? TrackingImpressionIds.SEARCH_RESULTS_OH : TrackingImpressionIds.FARMERS_MARKET_OH;
    }

    this.searchPath === PAGE_TYPES.ALL && (list = TrackingImpressionIds.SEARCH_RESULTS_ALL);
    this.trackingSrv.setInterimList(list);

    return list;
  }

  setTrackingGA4IdImpressions(): string {
    let listName: string;
    let search_results_all_sufix = '';

    switch (this.type) {
      case PAGE_TYPES.ADOPTIONS:
        listName = this.searchPath ? TrackingGA4ImpressionIds.SEARCH_RESULTS_ADOPT : TrackingGA4ImpressionIds.FARMERS_MARKET_ADOPTIONS;
        search_results_all_sufix = TrackingGA4ImpressionIds.SEARCH_RESULTS_ALL_ADOPTIONS_SUFFIX;
        break;
      case PAGE_TYPES.BOXES:
        listName = this.searchPath ? TrackingGA4ImpressionIds.SEARCH_RESULTS_OH : TrackingGA4ImpressionIds.FARMERS_MARKET_OH;
        search_results_all_sufix = TrackingGA4ImpressionIds.SEARCH_RESULTS_ALL_OH_SUFFIX;
        break;
      case PAGE_TYPES.ALL:
      default:
        listName = TrackingGA4ImpressionIds.SEARCH_RESULTS_ALL;
        break;
    }

    this.searchPath === PAGE_TYPES.ALL && (listName = TrackingGA4ImpressionIds.SEARCH_RESULTS_ALL + search_results_all_sufix);
    this.trackingSrv.setInterimGA4List(listName);

    return listName;
  }

  private trackClickPromotion(project: any, index: number): void {
    if (!this.type || !project) {
      return;
    }

    const PRODUCT_CODE = project.code;
    const items: IEcommerceTracking[] = [];
    const list = this.setTrackingIdImpressions();
    const listName = this.setTrackingGA4IdImpressions();
    const position = index + 1;

    this.trackingSrv.setPosition(position);
    this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.PRODUCT_CLICK, true, {
      click: {
        actionField: { list },
        products: [
          {
            name: project.code,
            id: project.up?.id,
            category: project.up?._m_up[this.langSrv.getCurrentLang()],
            brand: project.farmer?.brandName,
            position,
          },
        ],
      },
    });

    // TODO: fill in with IEcommerceTracking
    items.push({
      index: position,
      item_brand: project.farm?._m_name?.en,
      currency: this.currentCountry?.currency,
      price: this.type === PAGE_TYPES.ADOPTIONS ? project.filters?.price?.amount : project.filters?.ohPrice?.amount,
      item_variant: this.type === PAGE_TYPES.ADOPTIONS ? TrackingConstants.ITEM_VARIANT.ADOPT : TrackingConstants.ITEM_VARIANT.OH,
      quantity: 1,
      item_id: project.up?.id,
      item_category: project.up?.categoryName,
      item_category2: project.up?.subcategoryName,
      item_category3: project.up?._m_variety?.en,
      item_category4: project.up?.subvariety,
      item_list_name: listName,
      item_name: PRODUCT_CODE,
      // cart_number_items
      // product_id: project.code, product category id ?
      product_code: PRODUCT_CODE,
      // product_project_code: product_id + project.code
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
    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.SELECT_ITEM, true, { items });
  }

  ngOnDestroy(): void {
    this.currentLangSubscription?.unsubscribe();
    this.countrySubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
