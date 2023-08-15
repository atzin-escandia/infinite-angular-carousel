import {Component, EventEmitter, Output, Input, Injector, ViewEncapsulation} from '@angular/core';
import {BaseComponent} from '../base';

import {CountryService} from '@app/services';

@Component({
  selector: 'option-card',
  templateUrl: './option-card.component.html',
  styleUrls: ['./option-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OptionCardComponent extends BaseComponent {
  @Input() public optionSelected: boolean;
  @Input() public option: boolean;
  @Input() public favouriteSelected: boolean;
  @Input() public favourite: boolean;
  @Input() public pointer = true;
  @Input() public address: any;
  @Input() public fromPurchase: any;

  @Input() public onlySelected = false;

  @Output() public triggerRadio = new EventEmitter();

  @Input() public activeEdit = false;
  @Output() public triggerEdit = new EventEmitter();

  @Input() public activeDelete = false;
  @Output() public triggerDelete = new EventEmitter();

  constructor(public injector: Injector, public countrySrv: CountryService) {
    super(injector);
  }

  public clickEdit(): void {
    this.triggerEdit.emit();
  }

  public clickRadio(): void {
    this.triggerRadio.emit();
  }

  public clickDelete(): void {
    this.triggerDelete.emit();
  }
}
