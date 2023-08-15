import {Component, OnInit, Injector, ViewEncapsulation, HostBinding} from '@angular/core';
import {environment} from '../../../environments/environment';
import {PopoverBaseComponent} from '../base/base.component';

import * as dayjs from 'dayjs';

import {
  TextService,
  StorageService,
  ProjectsService
} from '../../services';

export class SelectedFilters {
  countries: any[];
  categories: any[];
  seals: any[];
}

const CLOSE_HEADER_TIME = 300;

@Component({
  selector: 'filter-popover',
  templateUrl: './filter-popover.html',
  styleUrls: ['./filter-popover.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FilterPopoverComponent extends PopoverBaseComponent implements OnInit {
  @HostBinding('class.popover-is-open') isOpen;
  @HostBinding('class') classes = this.domSrv.getIsDeviceSize('tablet') ? 'fixed' : '';
  public env = environment;
  public unfold = false;
  public onClose: any;
  public saveFilters: any;
  public removeSelectionEvt: any;
  public filter: any;
  public filters: any;
  public pickedFilter: string;
  public threeMonths = [];
  public datesRange: any;
  public dayjs: any = dayjs;
  public week: any = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  public monthsBlock = 0;
  public filterLoaded: boolean;
  // public selectedFilters: SelectedFilters = new SelectedFilters();
  public selectedFilters: SelectedFilters;

  constructor(
    public injector: Injector,
    public textSrv: TextService,
    public projectsSrv: ProjectsService,
    public storageSrv: StorageService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.start({
      active: true,
      style: 'background-color: rgba(0,0,0,0);',
      close: () => this.closeWithAnimation()
    });

    this.isOpen = true;
    setTimeout(() => {
      this.unfold = true;
    }, 100);

    setTimeout(() => {
      if (this.domSrv.getIsDeviceSize()) {
        this.domSrv.showHeader(false);
      }
    }, CLOSE_HEADER_TIME);

    if (this.pickedFilter === 'dates') {
      this.datesManage();
      this.datesRange = {};
    }
  }

  public monthsAheadBack(back = false): void {
    this.threeMonths = [];
    if (back) {
      this.monthsBlock > 0 ? (this.monthsBlock -= 1) : (this.monthsBlock = 0);
    } else {
      this.monthsBlock += 1;
    }
    this.datesManage();
  }

  public datesManage(): void {
    for (let i = this.monthsBlock * 3; i < this.monthsBlock * 3 + 3; i++) {
      this.threeMonths.push(this.dayjs.utc().add(i, 'month'));
    }
  }

  /**
   * Close popover
   */
  public closeWithAnimation(): void {
    this.unfold = false;
    this.domSrv.showHeader(true);
    this.isOpen = false;
    this.close();
    this.onClose({
      filter: this.filter,
      pickedFilter: this.pickedFilter,
      selectedFilters: this.selectedFilters
    });
  }

  public removeSelection(filter?: any[]): void {
    if (!this.domSrv.getIsDeviceSize() || filter) {
      // Desktop
      this.filter.map(e => (e.checked = false));
      this.saveFilters({
        filter: this.filter,
        pickedFilter: this.pickedFilter
      });
    } else {
      // Mobile
      this.removeSelectionEvt();
      this.selectedFilters = new SelectedFilters();
      this.domSrv.showHeader(true);
    }
  }

  public checkItem(id: string): void {
    this.filter[id].checked = !this.filter[id].checked;
    this.saveFilters({
      filter: this.filter,
      pickedFilter: this.pickedFilter
    });

    this.selectedFilters[this.pickedFilter] = this.filter.filter(filter => filter.checked === true);
  }

  public pickFilterEvt(filter: string): void {
    this.filterLoaded = false;
    this.filter = this.filters[filter];
    this.pickedFilter = filter;
    this.filterLoaded = true;
  }

  public applyQuery(): void {
    if (this.pickedFilter === 'dates') {
      this.filter[0] = {
        checked: true,
        queryValue: this.datesRange.fromDate
      };

      this.filter[1] = {
        checked: true,
        queryValue: this.datesRange.untilDate
      };
    }

    this.onClose({
      filter: this.filter,
      pickedFilter: this.pickedFilter,
      selectedFilters: this.selectedFilters
    });

    this.domSrv.showHeader(true);
  }
}
