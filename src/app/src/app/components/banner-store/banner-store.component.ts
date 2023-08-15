import { Component, OnInit, Injector, OnDestroy } from '@angular/core';
import { DeviceDetectorService, DeviceInfo } from 'ngx-device-detector';
import { BannerStoreService,  } from '@services/banner-store';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { BaseComponent } from '@components/base';

@Component({
  selector: 'banner-store-component',
  templateUrl: './banner-store.component.html',
  styleUrls: ['./banner-store.component.scss'],
})
export class BannerStoreComponent extends BaseComponent implements OnInit, OnDestroy {
  public deviceInfo: DeviceInfo;
  public privateZoneSubscription: Subscription;
  public fromApp = false;
  public privateZonePath = false;
  public subscriptionBoxPath = false;

  constructor(
    public injector: Injector,
    private deviceService: DeviceDetectorService,
    private bannerStoreSrv: BannerStoreService,
    public router: Router
  ) {
    super(injector);
    this.privateZoneSubscription = router.events.subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationEnd) {
        this.fromApp = routerEvent.url.includes('app=true');
        this.privateZonePath = routerEvent.url.includes('private-zone');
        this.subscriptionBoxPath = routerEvent.url.includes('subscription-box');
      }
    });
  }

  ngOnInit(): void {
    this.deviceInfo = this.deviceService.getDeviceInfo();
  }

  /**
   * Accept bannerStore
   */
  public closeBanner(): void {
    this.bannerStoreSrv.accept();
  }

  ngOnDestroy(): void {
    this.privateZoneSubscription.unsubscribe();
  }
}
