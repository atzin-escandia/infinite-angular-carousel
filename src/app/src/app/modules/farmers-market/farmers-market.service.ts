import {Location} from '@angular/common';
import {Injectable, Injector} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
  BaseService,
  ConfigService,
  CountryService,
  LangService,
  LoggerService,
  ProjectsService,
  StorageService,
  TrackingConstants,
  TrackingService,
  TrackingGA4Prefixes,
} from '@app/services';
import { first } from 'rxjs/operators';
import { PAGE_TYPES, Page } from '@modules/farmers-market/types/page.types';
import { Banners } from './interfaces/banners.interface';
import { Agroupments } from './interfaces/agroupments.interface';
import { ProjectsResource } from '@app/resources';
import { MetaData } from './interfaces/meta-data.interface';
import { Projects } from './interfaces/projects.interface';
import { CardService } from './services/card.service';
import { Filters } from '@enums/filters.enum';
import { IEcommerceTracking, UnknownObjectType } from '@app/interfaces';
import { SealsService } from '@pages/farmer/services/seals';
import { FILTERS_ALL_TAB, FILTERS_KEY, FILTERS_STORAGE_TIME } from './constants/filters.constants';
import { REMOTE_CONFIG } from '@app/constants/remote-config.constants';

const PAGE_SIZE = 12;
const MIN_LENGHT_AGROUPMENTS = {adoptions: 3, boxes: 4};
const MAX_LENGHT_AGROUPMENTS = 12;

@Injectable({
  providedIn: 'root'
})
export class FarmersMarketService extends BaseService {
  banners: Banners;
  agroupments: Agroupments;
  availableAgroupments = {
    adoptions: {
      top: {
        projects: []
      },
      bottom: {
        projects: []
      }
    },
    boxes: {
      top: {
        projects: []
      },
      bottom: {
        projects: []
      }
    }
  };
  projects = { adoptions: [], boxes: [] };
  metaDataBoxes: MetaData;
  metaDataAdoptions: MetaData;
  currentPages: { adoptions: number; boxes: number };
  isTopAgroupmentLoading = true;
  isBottomAgroupmentLoading = true;

  constructor(
    private configSrv: ConfigService,
    private projectsRsc: ProjectsResource,
    private loggerSrv: LoggerService,
    public router: Router,
    private route: ActivatedRoute,
    public location: Location,
    public countrySrv: CountryService,
    public injector: Injector,
    public cardSrv: CardService,
    public storageSrv: StorageService,
    public langSrv: LangService,
    public sealSrv: SealsService,
    private projectsSrv: ProjectsService,
    private trackingSrv: TrackingService,
  ) {
    super(injector);
  }

  init: any = () => null;

  getPageSize(): number {
    return PAGE_SIZE;
  }

  getBanners(): Banners {
    return this.banners;
  }

  getAgroupments(): Agroupments {
    return this.agroupments;
  }

  getAvailableAgroupments(type: Page): any{
    return this.availableAgroupments[type];
  }

  getIsTopAgroupmentLoading(): boolean {
    return this.isTopAgroupmentLoading;
  }

  getIsBottomAgroupmentLoading(): boolean {
    return this.isBottomAgroupmentLoading;
  }

  getProjectsByPage(): Projects {
    return this.projects;
  }

  getCurrentPages(): { adoptions: number; boxes: number } {
    return this.currentPages;
  }

  getMetaDataBoxes(): MetaData {
    return this.metaDataBoxes;
  }

  getMetaDataAdoptions(): MetaData {
    return this.metaDataAdoptions;
  }

  initFirebaseData(type: Page): void {
    this.setBanners();
    this.setAgroupments(type);
  }

  setIsTopAgroupmentLoading(isLoading: boolean): void {
    this.isTopAgroupmentLoading = isLoading;
  }

  setIsBottomAgroupmentLoading(isLoading: boolean): void {
    this.isBottomAgroupmentLoading = isLoading;
  }

  setCurrentPages(pages?: { adoptions: number; boxes: number }): void {
    const [adoptions, boxes] = ['adoptionsPage', 'boxesPage'].map((param) => +this.route.snapshot.queryParamMap.get(param) || 1);

    this.currentPages = pages || { adoptions, boxes };
  }

  setSortingKey(key: string): void {
    this.storageSrv.set('SORTING_KEY', key);
  }

  setCurrentFiltersKey(key: any): void {
    this.storageSrv.set('CURRENT_FILTERS', key);
  }

  formatIdParam(title: string): string {
    const formattedTitle = title?.toLowerCase().replace(/\s/g, '-');

    return formattedTitle?.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // To replace accents
  }

  async getAllProjects(type: string, search: any, queryParamsCode: any, page?: number): Promise<void> {
    const currentPages = this.getCurrentPages();

    if (type === FILTERS_ALL_TAB) {
      await this.setProjectsByPage({ page: page || currentPages.adoptions, search, ...queryParamsCode }, false);
      await this.setProjectsByPage({ page: page || currentPages.boxes, search, ...queryParamsCode }, true);
    } else {
      await this.setProjectsByPage({ page: page || currentPages?.[type], search, ...queryParamsCode }, type === PAGE_TYPES.BOXES);
    }
  }

  getParamsFromReq(params: UnknownObjectType, lang: string): UnknownObjectType {
    const filtersSetUp = this.storageSrv.get(FILTERS_KEY);
    let resultParams = {};
    const filters = {
      farmers: [],
      seals: [],
      categories: [],
      subcategories: []
    };

    filtersSetUp &&
      Object.keys(filtersSetUp).forEach((group) => {
        filtersSetUp[group] && filtersSetUp[group].forEach((id) => {
          if (params[group]) {
            if ((group === Filters.categories || group === Filters.seals || group === Filters.subcategories)) {
              const splitGroup = params[group].split(',');

              splitGroup.map(item => {
                if (item === (this.formatIdParam(id._m_name[lang]))) {
                  filters[group].push(id._id);
                }
              });
            }
            group === Filters.countries && params[group].includes(id.iso) && filters.farmers.push(id.iso);
          }
        });


        if (params[group]) {
        const currentGroup = group === Filters.countries ? 'farmers' : group;

          resultParams = {
            ...resultParams,
            [`${FILTERS_KEY}[${currentGroup}]`]: filters[currentGroup].join(','),
          };
        }
      });

    return resultParams;
  }

  async getFiltersCriteria(): Promise<{countries: any[]; categories: any[]; seals: any[]; subcategories: any[]}> {
    const filters = {
      countries: await this.projectsSrv.getFilterCriteria(Filters.farms),
      categories: await this.projectsSrv.getFilterCriteria(Filters.categories),
      seals: await this.projectsSrv.getFilterCriteria(Filters.seals),
      subcategories: await this.projectsSrv.getFilterCriteria(Filters.subcategories),
    };

    filters && this.storageSrv.set(FILTERS_KEY, filters, FILTERS_STORAGE_TIME);

    return filters;
  }

  getSortingKey(): string {
    return this.storageSrv.get('SORTING_KEY');
  }

  getCurrentFiltersKey(): string {
    return this.storageSrv.get('CURRENT_FILTERS');
  }

  async setProjectsByPage(params: any, isOh: boolean, isInvalidPage?: boolean): Promise<void> {
    if (params) {
      const { country, dates, page } = params;

      if (dates?.length) {
        params.dateFrom = params.dates[0];
        params.dateTo = params.dates.length > 1 && params.dates[1] ? params.dates[1] : params.dates[0];

        delete params.dates;
      }

      !country && (params.country = this.countrySrv.getCountry());
      params.limit = PAGE_SIZE;
      params = { ...params, start: (page - 1) * PAGE_SIZE };
      isOh && (params.oh = true);
    }

    try {
      const projects = await this.projectsRsc.getProjectsByPage(params);
      const { list, metadata } = this.modelize(projects);
      const totalPages = Math.ceil(metadata.total / metadata.limit);

      if (params.page > totalPages) {
        const newParams = {...params, page: 1};

        this.currentPages = {adoptions: 1, boxes: 1};

        await this.setProjectsByPage(newParams, isOh, true);

        return;
      }

      if (params.oh) {
        list.map( (project) => {
          project.overharvest = true;

          return project;
        });
        this.metaDataBoxes = metadata;
      } else {
        this.metaDataAdoptions = metadata;
      }

      if (list?.length) {
        // it does not make sense to process/wait when list has no results
        await this.cardSrv.setProjectSeals(list);
        this.cardSrv.setMbOptions(list);
      }

      (isOh) ? this.projects.boxes = this.cardSrv.setDefaultMasterBox(list) : this.projects.adoptions = list;

      isInvalidPage && this.resetPaginationQueryParams(isOh);
    } catch (error) {
      (isOh) ? this.projects.boxes = [] : this.projects.adoptions = [];
      this.metaDataBoxes = null;
      this.metaDataAdoptions = null;
      this.loggerSrv.error(error);
    }
  }

  async setProjectSeals(projects: any): Promise<void> {
    await this.sealSrv.setAllSeals();

    projects.forEach((project) => {
      project.upSeals = this.sealSrv.getCompleteSeals(project.up?.seals, project.up?.featuredSeal);
    });
  }

  resetPaginationQueryParams(isOh?: boolean): void {
    const queryParams = {
      ...this.route.snapshot.queryParams,
      [isOh ? 'boxesPage' : 'adoptionsPage']: 1,
    };

    const urlTree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });

    this.location.go(urlTree.toString());
  }

  async setAvailableAgroupments(type: Page): Promise<any> {
    if (!this.agroupments) {
      return;
    }

    const currentCountry = this.countrySrv.getCountry();
    const topAgroupmentId = this.agroupments[currentCountry]?.[type]?.top?.id;
    const bottomAgroupmentId = this.agroupments[currentCountry]?.[type]?.bottom?.id;
    const defaultTopAgroupmentId = this.agroupments.default[type].top?.id;
    const defaultBottomAgroupmentId = this.agroupments.default[type].bottom?.id;

    const [topAgroupment, bottomAgroupment] = await Promise.all([
      this.getTopAgroupment(topAgroupmentId, currentCountry, type),
      this.getBottomAgroupment(bottomAgroupmentId, currentCountry, type)
    ]);

    await Promise.all([
      this.setAvailableTopAgroupment(topAgroupment, type, defaultTopAgroupmentId, currentCountry),
      this.setAvailableBottomAgroupment(bottomAgroupment, type, defaultBottomAgroupmentId, currentCountry)
    ]);
  }

  private setBanners(): void {
    this.configSrv
      .getValue(REMOTE_CONFIG.BANNERS_FARMERS_MARKET)
      .pipe(first((res) => !!res))
      .subscribe(
        data => this.banners = data?._value
          ? JSON.parse(data._value)
          : { adoptions: { top: null, bottom: null }, boxes: { top: null, bottom: null } },
        () => this.banners = { adoptions: { top: null, bottom: null }, boxes: { top: null, bottom: null } }
      );
  }

  private setAgroupments(type: Page): void {
    const AGROUPMENTS_RESET = { default: null, es: null, fr: null, en: null };

    this.configSrv
      .getValue(REMOTE_CONFIG.AGROUPMENTS_FARMERS_MARKET)
      .pipe(first((res) => !!res))
      .subscribe(
        (data) => {
          if (data?._value) {
            this.agroupments = JSON.parse(data._value);
            void this.setAvailableAgroupments(type);
          } else {
            this.agroupments = AGROUPMENTS_RESET;
          }
        },
        () => this.agroupments = AGROUPMENTS_RESET
      );
  }

  private async getTopAgroupment(topAgroupmentId: string, currentCountry: string, type: Page): Promise<any> {
    try {
      if (topAgroupmentId) {
        const agroupment = await this.getAgroupmentById(topAgroupmentId, currentCountry, type);

        return agroupment;
      }
    } catch (error) {
      this.loggerSrv.error(error);

      return {name: '', projects: []};
    }
  }

  private async getBottomAgroupment(bottomAgroupmentId: string, currentCountry: string, type: Page): Promise<any> {
    try {
      if (bottomAgroupmentId) {
        const agroupment = await this.getAgroupmentById(bottomAgroupmentId, currentCountry, type);

        return agroupment;
      }
    } catch (error) {
      this.loggerSrv.error(error);

      return {name: '', projects: []};
    }
  }

  private async setAvailableTopAgroupment(
    topAgroupment,
    type: Page,
    defaultTopAgroupmentId: string,
    currentCountry: string
  ): Promise<any> {
    this.setIsTopAgroupmentLoading(true);
    const topAgroupmentProjects = topAgroupment?.projects;

    if (topAgroupmentProjects?.length >= MIN_LENGHT_AGROUPMENTS[type]) {
      await this.cardSrv.setProjectSeals(topAgroupmentProjects);
      this.cardSrv.setMbOptions(topAgroupmentProjects);
      this.availableAgroupments[type].top.projects = this.cardSrv.setDefaultMasterBox(topAgroupmentProjects);
      this.availableAgroupments[type].top._m_title = topAgroupment._m_title;
      this.trackTopAgroupmentsImpressions(type);
      this.setIsTopAgroupmentLoading(false);
    } else {
      try {
        if (defaultTopAgroupmentId) {
          const {_m_title, projects} = await this.getAgroupmentById(defaultTopAgroupmentId, currentCountry, type);

          await this.cardSrv.setProjectSeals(projects);
          this.cardSrv.setMbOptions(projects);

          this.availableAgroupments[type].top._m_title = _m_title;
          this.availableAgroupments[type].top.projects = this.cardSrv.setDefaultMasterBox(projects);
          this.trackTopAgroupmentsImpressions(type);
        }
      } catch (error) {
        this.loggerSrv.error(error);
        this.availableAgroupments[type].top.projects = [];
      } finally {
        this.setIsTopAgroupmentLoading(false);
      }
    }
  }

  private trackTopAgroupmentsImpressions(type: Page): void {
    this.trackAgroupmentsImpressions(
      this.availableAgroupments[type].top._m_title?.en,
      this.availableAgroupments[type].top.projects,
      type,
    );
  }

  private trackBottomAgroupmentsImpressions(type: Page): void {
    this.trackAgroupmentsImpressions(
      this.availableAgroupments[type].bottom._m_title?.en,
      this.availableAgroupments[type].bottom.projects,
      type,
    );
  }

  private trackAgroupmentsImpressions(list: string, projects: any, type: Page): void {
    if (!list || !projects?.length) {
      return;
    }

    const impressions = [];
    const items = [];
    const PREFIX = type === PAGE_TYPES.ADOPTIONS ? TrackingGA4Prefixes.FARMERS_MARKET_ADOPTIONS : TrackingGA4Prefixes.FARMERS_MARKET_OH;
    const listName = PREFIX + this.trackingSrv.buildListName(list);
    const countryCurrency = this.countrySrv.getCurrentCountry()?.currency;

    for (const [i, e] of projects.entries()) {
      impressions.push({
        name: e.code,
        list,
        id: e.up?.id,
        category: e.up?.category,
        brand: e.farmer?.brandName,
        position: parseInt(i) + 1
      });
      // TODO: fill in with IEcommerceTracking
      items.push({
        index: parseInt(i) + 1,
        item_brand: e.farm?._m_name?.en,
        currency: countryCurrency,
        price: e.overharvest ? e.filters?.ohPrice?.amount : e.filters?.price?.amount,
        item_variant: e.overharvest ? TrackingConstants.ITEM_VARIANT.OH : TrackingConstants.ITEM_VARIANT.ADOPT,
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
    this.trackingSrv.setInterimList(list);
    this.trackingSrv.setInterimGA4List(listName);
    this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.IMPRESSION, true, { impressions });
    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.VIEW_ITEM_LIST, true, { items });

  }

  private async setAvailableBottomAgroupment(
    bottomAgroupment,
    type: Page,
    defaultBottomAgroupmentId: string,
    currentCountry: string): Promise<any> {
    this.setIsBottomAgroupmentLoading(true);
    const bottomAgroupmentProjects = bottomAgroupment?.projects;

    if (bottomAgroupmentProjects?.length >= MIN_LENGHT_AGROUPMENTS[type]) {
      await this.cardSrv.setProjectSeals(bottomAgroupmentProjects);
      this.cardSrv.setMbOptions(bottomAgroupmentProjects);
      this.availableAgroupments[type].bottom.projects = this.cardSrv.setDefaultMasterBox(bottomAgroupmentProjects);
      this.availableAgroupments[type].bottom._m_title = bottomAgroupment._m_title;
      this.trackBottomAgroupmentsImpressions(type);
      this.setIsBottomAgroupmentLoading(false);
    } else {
      try {
        if (defaultBottomAgroupmentId) {
          const {_m_title, projects} = await this.getAgroupmentById(defaultBottomAgroupmentId, currentCountry, type);

          await this.cardSrv.setProjectSeals(projects);
          this.cardSrv.setMbOptions(projects);

          if (!projects.length) {
            this.setIsBottomAgroupmentLoading(false);
          }

          this.availableAgroupments[type].bottom._m_title = _m_title;
          this.availableAgroupments[type].bottom.projects = this.cardSrv.setDefaultMasterBox(projects);
          this.trackBottomAgroupmentsImpressions(type);
        }
      } catch (error) {
        this.loggerSrv.error(error);
        this.availableAgroupments[type].bottom.projects = [];
      } finally {
        this.setIsBottomAgroupmentLoading(false);
      }
    }
  }

  private async getAgroupmentById(id: string, country: string, type: Page): Promise<any> {
    const agroupment = await this.projectsRsc.getAgroupmentsById(id, {country, limit: MAX_LENGHT_AGROUPMENTS});

    if (agroupment?.projects?.length < MIN_LENGHT_AGROUPMENTS[type]) {
      return {name: '', projects: []};
    }

    return agroupment;
  }
}
