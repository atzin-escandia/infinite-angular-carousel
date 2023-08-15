import { Component, Injector, Input, ViewEncapsulation } from '@angular/core';
import { PopoverService } from '@app/services/popover';
import { DomService } from '../../../../services';

@Component({
  selector: 'filters-menu-btn',
  templateUrl: './filters-menu-btn.component.html',
  styleUrls: ['./filters-menu-btn.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FiltersMenuBtnComponent {
  customClose: () => void;
  @Input() idPage: string;
  isMobile: boolean;

  constructor(public injector: Injector, public popoverSrv: PopoverService, public domSrv: DomService) {
    this.isMobile = this.domSrv.getIsDeviceSize();
  }

  openFiltersMenu(): void {
    this.popoverSrv.open(
      'FiltersMenuPopoverComponent',
      'header-notification-container',
      {
        inputs: {
          idPage: this.idPage,
          customClose: () => {
            this.popoverSrv.close('FiltersMenuPopoverComponent');
          },
        },
        outputs: {},
      },
      true,
      false
    );
  }
}
