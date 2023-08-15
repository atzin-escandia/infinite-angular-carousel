import { Component, EventEmitter, Injector, Input, Output, ViewEncapsulation } from '@angular/core';
import { HeaderSeal } from '@app/interfaces';
import { BaseComponent } from '@components/base';
import { RouterService } from '@app/services';
import { FavouritesSection } from '@interfaces/favourites.interface';

@Component({
  selector: 'up-header',
  templateUrl: './up-header.component.html',
  styleUrls: ['./up-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UpHeaderComponent extends BaseComponent {
  @Input() public up: any;
  @Input() public ss: any;
  @Input() public farm: any;
  @Input() public headerBoxesInfo: any;
  @Input() public selectedCountry: string;
  @Input() public countriesByIso: any;
  @Input() public availableCountriesByISO: any;
  @Input() public seals: HeaderSeal[] = [];

  @Output() public showUpCardMobile = new EventEmitter<any>();
  @Output() public openCard = new EventEmitter<any>();
  @Output() public openLocationEvn = new EventEmitter<void>();

  detailKey = FavouritesSection.DETAIL;

  constructor(public injector: Injector, public routerSrv: RouterService) {
    super(injector);
  }

  public manageAdding(available: boolean): void {
    if (available) {
      if (this.domSrv.getIsDeviceSize()) {
        this.showUpCardMobile.emit(true);
      } else {
        this.domSrv.scrollTo('#up-card');
        this.openCard.emit(true);
      }
    } else {
      this.routerSrv.navigateToFarmersMarket('ADOPTION');
    }
  }
}
