import { Component, Injector } from '@angular/core';
import { BaseComponent } from '@app/components';
import { RouterService } from '@app/services';

@Component({
  selector: 'no-gift-landing',
  templateUrl: './gift-unavailable-landing.page.html',
  styleUrls: ['./gift-unavailable-landing.page.scss'],
})
export class GiftUnavailableLandingPageComponent extends BaseComponent {
  constructor(public injector: Injector, public routerSrv: RouterService) {
    super(injector);
  }

  public goToFarmersMarket(): void {
    this.routerSrv.navigateToFarmersMarket('ADOPTION');
  }
}
