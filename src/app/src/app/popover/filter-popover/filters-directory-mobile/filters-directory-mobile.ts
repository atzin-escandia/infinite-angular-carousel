import {Component, EventEmitter, Injector, Input, Output} from '@angular/core';
import {PopoverBaseComponent} from '../../base/base.component';

@Component({
  selector: 'filters-directory',
  templateUrl: './filters-directory-mobile.html',
  styleUrls: ['./filters-directory-mobile.scss']
})
export class FiltersDirectoryComponent extends PopoverBaseComponent {
  @Input() public selectedFilters: any;

  @Output() public pickFilterEvt = new EventEmitter();
  @Output() public removeSelectionEvt = new EventEmitter();

  public pickedFilter: any;
  public pickedFilterName: any;
  public filterShown = false;

  public menuFilters = [
    {
      buttonText: 'categories',
      value: 'categories'
    },
    {
      buttonText: 'Farmer country',
      value: 'countries'
    },
    {
      buttonText: 'filter',
      value: 'seals'
    }
  ];

  constructor(public injector: Injector) {
    super(injector);
  }

  public pickFilter(filter: string): void {
    this.pickFilterEvt.emit(filter);
    this.pickedFilter = filter;
    this.filterShown = !this.filterShown;

    this.pickedFilterName = this.menuFilters.find(menufilter => menufilter.value === filter);
  }

  public removeSelection(): void {
    this.removeSelectionEvt.emit(this.pickedFilter);
    this.selectedFilters[this.pickedFilter] = [];
  }
}
