import { Component, EventEmitter, Injector, Input, Output, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from '@components/base';

@Component({
  selector: 'up-when-information',
  templateUrl: './up-when-information.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class UpWhenInformationComponent extends BaseComponent {
  @Input() availableDates: any = {};
  @Input() infoBlock: any = {};
  @Input() blockName: string;
  @Input() upInformationReplacements: any;
  @Input() sellingMethod: string;
  @Output() openPopup: any = new EventEmitter();

  constructor(public injector: Injector) {
    super(injector);
  }

  public openMsInfoPopup(): void {
    this.openPopup.emit();
  }
}
