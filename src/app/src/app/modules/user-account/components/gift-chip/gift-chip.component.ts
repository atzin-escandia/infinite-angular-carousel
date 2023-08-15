import { Component, Injector, Input } from '@angular/core';
import { BaseComponent } from '@app/components';
@Component({
  selector: 'gift-chip',
  templateUrl: './gift-chip.component.html',
  styleUrls: ['./gift-chip.component.scss'],
})
export class GiftChipComponent extends BaseComponent {
  @Input() message: string;

  constructor(public injector: Injector) {
    super(injector);
  }
}
