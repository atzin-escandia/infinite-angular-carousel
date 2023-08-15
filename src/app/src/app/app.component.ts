import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, Scroll } from '@angular/router';
import {
  TrackingService,
  StorageService,
  LoggerService,
  CountryService,
  CartsService,
  RouterService,
  DomService,
  SeoService,
  TrackingConstants,
  TextService,
} from './services';
import { environment } from '../environments/environment';
import { PopupService } from './services/popup';
import { ConfigService } from './services/config/config.service';
import { StatusPopupComponent } from './popups/status-popup';
import { BannerStoreService } from './services/banner-store';
import { VisitFromComponent } from './popups/visit-from/visit-from.component';
import { PopupsRef } from './popups/popups.ref';
import { VisitFromStorageKey } from './enums/storage-key-visit-from.enum';
import { Device } from './enums/device.enum';
import { DeviceWidth } from './enums/device-width.enum';
import { StateService } from './services/state/state.service';
import { delay, filter, first, mergeMap, timeout } from 'rxjs/operators';
import { ViewportScroller } from '@angular/common';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public countries: any[];
  public currentCountry: string;
  private currentCountryName: string;
  public isAvailableCountry: boolean;
  public availableCountries: any[];
  public allCountries: any[];
  private visitFromModal: PopupsRef;
  private isNoCountryDetected = false;

  // Detect screen size to paint carousel
  public isSmallScreen = false;
  @HostListener('window:resize', ['$event'])
  onResize(e: Event): void {
    const target = e.target as Window;

    this.domSrv.setIsMobile(target.innerWidth);
    this.isSmallScreen = target.innerWidth < DeviceWidth.XL;
  }

  get navbarElemHeight(): number {
    const space = this.stateSrv.showGreenBanner ? 100 : 70;

    return this.domSrv.document.getElementById('navbar-container')?.offsetHeight || space;
  }

  constructor(
    private trackingSrv: TrackingService,
    private storageSrv: StorageService,
    public bannerStoreSrv: BannerStoreService,
    private logSrv: LoggerService,
    private seoSrv: SeoService,
    public popupSrv: PopupService,
    private countrySrv: CountryService,
    private cartSrv: CartsService,
    public domSrv: DomService,
    public routerSrv: RouterService,
    public textSrv: TextService,
    public stateSrv: StateService,
    private router: Router,
    public route: ActivatedRoute,
    private configSrv: ConfigService,
    public viewportScroller: ViewportScroller
  ) {
    router.events
      .pipe(filter((e): e is Scroll => e instanceof Scroll))
      .pipe(delay(1))
      .subscribe((e) => {
        if (e.position) {
          viewportScroller.scrollToPosition(e.position);
        } else if (e.anchor) {
          viewportScroller.scrollToAnchor(e.anchor);
        } else {
          viewportScroller.scrollToPosition([0, 0]);
        }
      });
  }

  public ngOnInit(): void {
    let country = null;

    if (this.domSrv.isPlatformBrowser()) {
      const parameters = new URLSearchParams(window.location.search);

      country = parameters.get('country') || null;
    }

    void this._asyncZone(country);

    this.seoSrv.init();
    this.logSrv.init();
    this.storageSrv.init();
    this.trackingSrv.init();
    this.bannerStoreSrv.init();
    this.cartSrv.init();

    // Set version of app
    this.storageSrv.set('appVersion', environment.VERSION);

    // Get device size
    this.isSmallScreen = this.domSrv.getIsDeviceSize(Device.LAPTOP);

    // Logic to show modal including webview from app
    if (this.availableCountries) {
      this.checkModalVisit();
    }
  }

  private async _asyncZone(country): Promise<void> {
    await this.configSrv.init();

    // Get countries
    const [countries, allCountries] = await this.countrySrv.init(country);

    this.availableCountries = countries;
    this.allCountries = allCountries;

    this.configSrv.isRemoteConfigLoaded$.pipe(
      first((val) => !!val),
      timeout(10000),
      mergeMap(() => this.stateSrv.isGreenBannerActive())
    ).subscribe((val) => {
      this.stateSrv.setShowGreenBanner(val);
    });

    this.configSrv.isRemoteConfigLoaded$.pipe(
      first((val) => !!val),
      timeout(10000),
      mergeMap(() => this.stateSrv.isProductGiftAvailable())
    ).subscribe((val) => {
      this.stateSrv.setGift(val);
    });
  }

  private checkModalVisit(): void {
    this.router.events.subscribe(async (data: any): Promise<void> => {
      const obj: NavigationEnd = await data;

      // Get the location inside the navigateion end so once the redirection has
      // finished we get the location(to avoid not retriving if the modal shows before lang has been set)
      if (obj instanceof NavigationEnd) {
        this.route.queryParams.subscribe(async params => {
          if (!params.app) {
            this.currentCountry = this.storageSrv.get('location');
            if (this.currentCountry) {
              const countryObj = await this.countrySrv.getCountryByIso(this.currentCountry);

              this.currentCountryName = countryObj?.name;
            }
            this.isAvailableCountry = this.availableCountries.filter((country: any) => country.iso === this.currentCountry).length > 0;
            if (!this.currentCountry) {
              this.isNoCountryDetected = true;
            }
            this.manageModalVisitFrom();
          }
        });
      }
    });
  }

  private manageModalVisitFrom(): void {
    // country is detected and is not in our 32 countries we deliver
    const hasSoftRegister = this.storageSrv.get(VisitFromStorageKey.softRegistered);
    const hasNotAvailableShipmentCountry = this.storageSrv.get(VisitFromStorageKey.notAvailableShipmentCountry);
    const hasCountryAmongShipmentCountries = this.storageSrv.get(VisitFromStorageKey.countryAmongShipmentCountries);

    if (!this.isAvailableCountry) {
      if (!hasSoftRegister && !hasNotAvailableShipmentCountry && this.routerSrv.checkCountryPopup()) {
        this.initModal(VisitFromStorageKey.notAvailableShipmentCountry);
      }
      // country is not detected(null)
    } else if (this.isNoCountryDetected && !hasNotAvailableShipmentCountry) {
      this.initModal(VisitFromStorageKey.notAvailableShipmentCountry);
      // country is detected and is among our countries
    } else if (this.isAvailableCountry && !hasCountryAmongShipmentCountries) {
      this.initModal(VisitFromStorageKey.countryAmongShipmentCountries);
    }
    this.subscribeToCloseModal();
  }

  private initModal(key: string): void {
    this.storageSrv.set(key, true);
    this.showModal();
  }

  private showModal(): void {
    this.visitFromModal = this.popupSrv.open(VisitFromComponent, {
      data: {
        currCountryIso: this.currentCountry,
        currCountryName: this.currentCountryName || '',
        allCountries: this.allCountries,
        countriesWeSend: this.availableCountries,
        isNoCountryDetected: this.isNoCountryDetected,
        isAvailableCountry: this.isAvailableCountry,
      },
    }, true);
  }

  private subscribeToCloseModal(): void {
    this.isNoCountryDetected = false;
    if (this.visitFromModal) {
      this.visitFromModal.onClose.subscribe(res => {
        if (res) {
          const confirmMsg = this.popupSrv.open(StatusPopupComponent, {
            data: {
              msgSuccess: 'Your information has been correctly registered',
            },
          });

          confirmMsg.onClose.subscribe(() => this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.OOSZ));
        }
      });
    }
  }
}
