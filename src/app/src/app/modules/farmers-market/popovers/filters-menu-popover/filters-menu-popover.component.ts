import { Component, OnInit, Injector, OnDestroy, HostBinding, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectsService, RouterService, StorageService } from '@app/services';
import { PopoverBaseComponent } from '@app/popover';
import { Filters } from '@app/enums/filters.enum';
import { UnknownObjectType } from '@app/interfaces';
import { CLOSE_ANIMATION_TIME, FILTERS_KEY, MENU_FILTERS } from '../../constants/filters.constants';
import { FarmersMarketService } from '../../farmers-market.service';

@Component({
  selector: 'filters-menu-popover',
  templateUrl: './filters-menu-popover.component.html',
  styleUrls: ['./filters-menu-popover.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltersMenuPopoverComponent extends PopoverBaseComponent implements OnInit, OnDestroy {
  @HostBinding('class.popover-is-open') isOpen;
  customClose: () => void;
  idPage: string;
  groupFilters = {
    countries: [],
    categories: [],
    seals: [],
  };
  menuFilters = MENU_FILTERS;
  filters: UnknownObjectType;
  selectedFilters: UnknownObjectType;
  lang: string;
  tab: string;
  isFilterActive: boolean;
  isMobile: boolean;

  constructor(
    public injector: Injector,
    public storageSrv: StorageService,
    public router: Router,
    public farmersMarketSrv: FarmersMarketService,
    private route: ActivatedRoute,
    public routerSrv: RouterService,
    public projectsSrv: ProjectsService
  ) {
    super(injector);
    this.isMobile = this.domSrv.getIsDeviceSize();
  }

  ngOnInit(): void {
    this.filters = this.groupFilters;
    this.selectedFilters = this.groupFilters;
    void this.setAvailableFilters();

    this.start({
      active: true,
      style: 'opacity: 0.24; background-color: #1a1a1a; z-index: 200',
      close: () => {
        this.closePopover();
      },
    });
    setTimeout(() => {
      this.isOpen = true;
    }, 0);

    this.lang = this.langSrv.getCurrentLang();
    this.tab = this.route.snapshot.queryParams.tab || this.idPage;
  }

  ngOnDestroy(): void {
    this.isOpen = false;
  }

  isFiltersActivated(): void {
    this.isFilterActive = !!Object.keys(this.selectedFilters).find((item) => this.selectedFilters[item].length);
  }

  checkItem(group: string, index: number): void {
    this.filters[group][index].checked = !this.filters[group][index].checked;
    const currentItem = this.filters[group][index];

    if (this.selectedFilters[group].length) {
      const isFilterSelected = !!this.selectedFilters[group].find((item) => item?._id === currentItem?._id);

      isFilterSelected
        ? (this.selectedFilters[group] = this.selectedFilters[group].filter((v) => v._id !== currentItem._id))
        : this.selectedFilters[group].push(currentItem);
    } else {
      this.selectedFilters[group].push(currentItem);
    }
    this.isFiltersActivated();
  }

  search(): void {
    const params = this.getQueryParams();
    const search = this.route.snapshot.queryParamMap.get('q');

    if (search) {
      params.q = search;
    }

    params.q = search;
    this.routerSrv.navigate('search/', this.lang, params);
    this.closePopover();
  }

  async setAvailableFilters(): Promise<void> {
    const storagedFilters = await this.storageSrv.get(FILTERS_KEY);

    this.filters = storagedFilters || (await this.farmersMarketSrv.getFiltersCriteria());
    this.filters && void this.initFilterData();
  }

  initFilterData(): void {
    const { queryParams } = this.route.snapshot;

    queryParams && this.setParamsFromURL(queryParams);
    this.setSelectedFilters();
  }

  setParamsFromURL(queryParams: UnknownObjectType): void {
    Object.keys(this.filters).forEach((group) => {
      this.filters[group].forEach((a) => {
        if (queryParams[group]) {
          const currentItem = this.setParamToURL(group, a);
          const currentParamsGroup = queryParams[group].split(',');

          currentParamsGroup.map((item) => {
            if (item === currentItem) {
              a.checked = true; // Set by default to checked
              this.selectedFilters[group].push(a);
            }
          });
        }
      });
    });
  }

  setParamToURL(group: string, item: { _m_name: { [x: string]: string }; iso: string }): string {
    return group === Filters.categories || group === Filters.seals ? this.formatIdParam(item._m_name[this.lang]) : item.iso;
  }

  setSelectedFilters(): void {
    Object.keys(this.filters).forEach((group) => {
      this.filters[group].forEach((filter) => {
        const isFilterSelected = !!this.selectedFilters[group].find((item) => item?._id === filter?._id);

        if (filter.checked && !isFilterSelected) {
          this.selectedFilters[group].push(filter);
        }
      });
    });
    this.isFiltersActivated();
  }

  formatIdParam(title: string): string {
    const formattedTitle = title.toLowerCase().replace(/\s/g, '-');

    return formattedTitle.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // To replace accents
  }

  getQueryParams(): UnknownObjectType {
    let params = {};

    Object.keys(this.selectedFilters).forEach((group) => {
      const stringIds = this.selectedFilters[group].map((id) =>
        group === Filters.categories || group === Filters.seals || group === Filters.subcategories
          ? this.formatIdParam(id._m_name[this.lang])
          : id.iso
      );

      if (this.selectedFilters[group].length) {
        params = {
          ...params,
          tab: this.tab,
          [group]: stringIds.join(','),
        };
      }
    });

    return params;
  }

  clearFilters(): void {
    this.resetFilters();
    this.isFiltersActivated();
  }

  resetFilters(): void {
    Object.keys(this.selectedFilters).forEach((group) => (this.selectedFilters[group] = []));
    Object.keys(this.filters).forEach((group) => this.filters[group].forEach((filter) => (filter.checked = false)));
  }

  closePopover(): void {
    this.isOpen = false;

    setTimeout(() => {
      this.close();
      if (this.customClose) {
        this.customClose();
      }
    }, !this.isMobile && CLOSE_ANIMATION_TIME);
  }
}
