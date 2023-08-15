import {Component, EventEmitter, Injector, Input, Output} from '@angular/core';
import {PopoverBaseComponent} from '../../base/base.component';

@Component({
  selector: 'filters-container',
  templateUrl: './filters-container.html',
  styleUrls: ['./filters-container.scss']
})
export class FiltersContainerComponent extends PopoverBaseComponent {
  @Input() public filter: any;
  @Input() public pickedFilter: string;

  @Output() public checkItemEvt = new EventEmitter();

  constructor(public injector: Injector) {
    super(injector);
  }

  public checkItem(id: number, disabled = false): void {
    if (disabled === false) {
      this.checkItemEvt.emit(id);
    }
  }
}
