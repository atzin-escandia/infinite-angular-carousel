import { Component, Injector, Input } from '@angular/core';
import { BaseComponent } from '../base';
import { BannerStoreService } from '@services/banner-store';

@Component({
  selector: 'smart-app-banner-component',
  templateUrl: './smart-app-banner.component.html',
  styleUrls: ['./smart-app-banner.component.scss'],
})
export class SmartAppBannerComponent extends BaseComponent {
  @Input() deviceInfo;

  constructor(
    public injector: Injector,
    private bannerStoreSrv: BannerStoreService
  ) {
    super(injector);
  }

  /**
   * Accept bannerStore
   */
  public closeBanner(): void {
    this.bannerStoreSrv.accept();
  }
  /**
   * Accept bannerStore
   */
  public redirectStore(): void {
    if (this.deviceInfo === 'iOS') {
      window.location.href = 'https://cfarming.eu/AppleStore';
    } else if (this.deviceInfo === 'Android') {
      window.location.href = 'https://cfarming.eu/PlayStore';
    }
  }
}
