import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { Location } from '@angular/common';
import { CountryService, DomService, LangService, StorageService } from '@app/services';
import { Device } from '@app/enums/device.enum';
import { FILTERS_KEY, SORTING_FILTERS } from '../../constants/filters.constants';
import { FarmersMarketService } from '../../farmers-market.service';
import { QueryParams } from '../../interfaces/query-params.interface';
import { Subscription } from 'rxjs';
import { TypeSorting } from '../../interfaces/type-sorting.interface';
import { Filters } from '@enums/filters.enum';
import { PAGE_TYPES } from '../../types/page.types';

@Component({
  selector: 'sorting-selector',
  templateUrl: './sorting-selector.component.html',
  styleUrls: ['./sorting-selector.component.scss'],
})
export class SortingSelectorComponent implements OnInit, OnDestroy {
  customClose: () => void;
  @Input() idPage: string;
  @Input() changeCountry: string;
  options: TypeSorting [];
  isDesktop: boolean;
  selectedSortKey: string;
  selectedOption: TypeSorting;
  private countrySubscription = new Subscription();


  constructor(
    public injector: Injector,
    public translocoSrv: TranslocoService,
    public route: ActivatedRoute,
    public location: Location,
    public router: Router,
    public farmersMarketSrv: FarmersMarketService,
    public domSrv: DomService,
    public countrySrv: CountryService,
    public langSrv: LangService,
    private storageSrv: StorageService
  ) {}

  ngOnInit(): void {
    this.isDesktop = this.domSrv.getIsDeviceSizeV2(Device.DESKTOP);

    this.options = [
      {
        text: '',
        id: SORTING_FILTERS.relevance.name,
        key: 'global.relevance.drop',
        active: this.farmersMarketSrv.getSortingKey() === 'relevance'
      },
      {
        text: '',
        id: SORTING_FILTERS.firstShippingDate.name,
        key: 'page.first-shipping-date.page',
        active: this.farmersMarketSrv.getSortingKey() === 'date'
      },
      {
        text: '',
        id: SORTING_FILTERS.lowestPrice.name,
        key: 'global.lowest-price.button',
        active: this.farmersMarketSrv.getSortingKey() === 'price'
      },
    ];

    this.translocoSrv.selectTranslation().subscribe(_ => {
      this.options = this.options.map(option => ({
        ...option,
        text: this.translocoSrv.translate(option.key)
      }));

      if (this.selectedOption) {
        this.selectedOption = this.options.find(option => this.selectedOption.id === option.id);
      }

      this.options = [...this.options].sort((a, b) => Number(b.active) - Number(a.active));

    });

    this.setSortingInit();

    this.countrySubscription = this.countrySrv.countryChange().subscribe(() => {
      this.options = this.options.map(option => ({
        ...option,
        active: option.id === SORTING_FILTERS.relevance.name
      }));

      this.options = [...this.options].sort((a, b) => Number(b.active) - Number(a.active));
      this.selectedOption = this.options[0];
    });
  }

  setSortingInit(): void {
    !this.farmersMarketSrv.getSortingKey() && this.farmersMarketSrv.setSortingKey(SORTING_FILTERS.relevance.id);
    this.selectedOption = this.options[0];
  }


  async sortCatalogue(type: any): Promise<void> {
    const sort = SORTING_FILTERS[type.id].id;

    this.selectedOption = type;

    const search = this.route.snapshot.queryParamMap.get('q');
    const queryParams: QueryParams = this.idPage === PAGE_TYPES.BOXES ? { boxesPage: 1 } : { adoptionsPage: 1 };

    queryParams.sort = sort;
    const urlTree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });

    this.farmersMarketSrv.setCurrentPages({ adoptions: 1, boxes: 1 });
    this.farmersMarketSrv.setSortingKey(sort);
    this.location.go(urlTree.toString());

    const params: {page: number; sort: string; search?: string} = {
      page: 1,
      sort
    };

    search && (params.search = search);

    const currentFilters = this.farmersMarketSrv.getCurrentFiltersKey();
    let filtersIds = {};

    if (currentFilters) {
      const filtersObject = await this.getFilterParams(currentFilters);

      filtersIds = this.farmersMarketSrv.getParamsFromReq(filtersObject, this.langSrv.getCurrentLang());
    }


    if (this.idPage === PAGE_TYPES.ALL) {
      await this.farmersMarketSrv.setProjectsByPage({...params, ...filtersIds}, true);
      await this.farmersMarketSrv.setProjectsByPage({...params, ...filtersIds}, false);
    } else {
      await this.farmersMarketSrv.setProjectsByPage({...params, ...filtersIds} , this.idPage === PAGE_TYPES.BOXES);
    }
  }

  ngOnDestroy(): void {
    this.countrySubscription.unsubscribe();
  }

  async getFilterParams(filters: any): Promise<any> {
    const params = {};

    let filtersSetUp = this.storageSrv.get(FILTERS_KEY);

    if (!filtersSetUp) {
      filtersSetUp = await this.farmersMarketSrv.getFiltersCriteria();
    }

    Object.keys(filters).forEach((group) => {
      const stringIds = filters[group].map((id) =>
        group === Filters.categories || group === Filters.seals ? id :
        filtersSetUp?.countries.find(country =>
          this.farmersMarketSrv.formatIdParam(country._m_name[this.langSrv.getCurrentLang()]) === id).iso);

      if (filters[group].length) {
        params[group] = stringIds.join(',');
      }
    });

    return params;
  }
}
