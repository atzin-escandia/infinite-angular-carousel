import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { DISCOVERY_BOX_VALID_COUNTRIES } from '@app/pages/subscription-box/constants/subscription-box.constants';
import { SubscriptionBoxService } from '@app/pages/subscription-box/services';
import { AuthService, CountryService, FavouriteService, RouterService, StateService } from '@app/services';
import { LEFT_TRANSITION_TIMEOUT, NO_TRANSITION_TIMEOUT } from '@constants/transitions.constants';
import { Subject, Subscription, combineLatest, filter, takeUntil, tap } from 'rxjs';
import { BaseComponent } from '../base';

@Component({
  selector: 'mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.scss'],
})
export class MobileMenuComponent extends BaseComponent implements OnInit, OnDestroy {
  mobileLinks: any = {};
  ups: any = [];
  showprivateMenu = false;
  showCountries = false;
  countrySubscription: Subscription;
  languages = this.langSrv.getMenuLangs();
  linksPrivateZone = this.routerSrv.getMenuRoutes();
  linksFarmersMarket = this.routerSrv.getFarmersMarketRoutes(false);
  country: string;
  private closeTimeout: any;
  private backTimeout: any;
  removeMobileMenu = false;
  isMenuOpen = true;
  destroy$ = new Subject<void>();

  constructor(
    public injector: Injector,
    public authSrv: AuthService,
    public routerSrv: RouterService,
    private countrySrv: CountryService,
    public favouriteSrv: FavouriteService,
    private subscriptionBoxSrv: SubscriptionBoxService,
    private stateSrv: StateService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.country = this.storageSrv.get('location') || null;
    this.countrySubscription = this.countrySrv.countryChange().subscribe((country) => (this.country = country));

    const firebaseMenu$ = this.subscriptionBoxSrv.discoveryBoxMenuFirebase$;
    const currentCountry$ = this.stateSrv.$currentCountry;

    // Add Discovery Box Subscription option to menu
    combineLatest([firebaseMenu$, currentCountry$])
      .pipe(
        takeUntil(this.destroy$),
        filter(([firebaseMenu]) => firebaseMenu === true),
        tap(([, country]) => {
          this.linksFarmersMarket = this.routerSrv.getFarmersMarketRoutes(false, DISCOVERY_BOX_VALID_COUNTRIES.includes(country));

          if (DISCOVERY_BOX_VALID_COUNTRIES.includes(country) && !this.linksPrivateZone.find((item) => item.id === 'my-subscriptions')) {
            this.linksPrivateZone.splice(4, 0, this.routerSrv.getDiscoveryBoxMenu());
            this.linksPrivateZone.join();
          }
          if (!DISCOVERY_BOX_VALID_COUNTRIES.includes(country)) {
            this.linksPrivateZone = this.linksPrivateZone.filter((item) => item.id !== 'my-subscriptions');
          }
        })
      )
      .subscribe();
  }

  private closeAction(): void {
    clearTimeout(this.closeTimeout);
  }

  private backAction(): void {
    this.popoverSrv.close('LocationLangMobileComponent');
    clearTimeout(this.backTimeout);
  }

  /**
   * Opens Delivery Country/Languages drop-down
   */
  showLocationLangMobileSelector(isDeliveryCountry: boolean): void {
    this.popoverSrv.close();

    this.popoverSrv.open('LocationLangMobileComponent', 'app-block', {
      inputs: {
        isDeliveryCountry,
        showCloseButton: true,
      },
      outputs: {
        onClose: (closeMobileMenu: boolean): void => {
          if (closeMobileMenu) {
            this.closeCurrentPopUp('LocationLangMobileComponent');
          } else {
            this.backTimeout = setTimeout(() => {
              this.backAction();
            }, LEFT_TRANSITION_TIMEOUT);
          }
        },
      },
    });
  }

  logout(): void {
    this.authSrv.logout();
    this.routerSrv.navigate('home');
    this.utilsSrv.closeMobileMenu();

    this.popoverSrv.close('PrivateMobileMenuComponent');
  }

  closeCurrentPopUp(component: string): void {
    this.closeMobileMenu();
    this.removeMobileMenu = true;
    this.popoverSrv.close(component);
    this.closeTimeout = setTimeout(() => {
      this.closeAction();
      this.removeMobileMenu = false;
    }, NO_TRANSITION_TIMEOUT);
  }

  openUserMenu(): void {
    this.popoverSrv.open('PrivateMobileMenuComponent', 'header-notification-container', {
      inputs: {
        isBackActive: true,
      },
      outputs: {
        onClose: (closeMobileMenu: boolean): void => {
          if (closeMobileMenu) {
            this.closeCurrentPopUp('PrivateMobileMenuComponent');
          } else {
            this.backTimeout = setTimeout(() => {}, LEFT_TRANSITION_TIMEOUT);
          }
        },
      },
    });
  }

  manifest(): void {
    this.routerSrv.navigateToManifest();
    this.utilsSrv.closeMobileMenu();
  }

  goToBlog(): void {
    let lang = this.langSrv.getCurrentLang();

    if (['nl', 'it', 'sv'].includes(lang)) {
      lang = 'en';
    }

    window.open('https://www.crowdfarming.com/' + 'blog/' + lang);
  }

  login(register: boolean): void {
    this.routerSrv.navigate('login-register/' + (register ? 'register' : 'login'));
    this.utilsSrv.closeMobileMenu();
  }

  navigate(route: string): void {
    this.routerSrv.navigate(route);
    this.utilsSrv.closeMobileMenu();
  }

  farmersMarketNavigate(route: string): void {
    this.routerSrv.navigateToFarmersMarket(route);
    this.utilsSrv.closeMobileMenu();
  }

  redirect(fragment: string): void {
    if (this.routerSrv.getIsHome()) {
      try {
        this.domSrv.scrollTo(fragment);
      } catch (e) {
        console.log(e);
      }
    } else {
      this.routerSrv.navigate('home', null, { fragment: fragment.split('#')[1] });
    }

    this.utilsSrv.closeMobileMenu();
  }

  mobileMenuNavigate(route: string): void {
    this.routerSrv.navigateToSpecificUrl(route);
    this.utilsSrv.closeMobileMenu();
  }

  closeMobileMenu(): void {
    this.utilsSrv.closeMobileMenu();

    // Set a false inner menus
    this.showprivateMenu = false;
    this.showCountries = false;
  }

  toggleOpen(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  ngOnDestroy(): void {
    if (this.countrySubscription) {
      this.countrySubscription.unsubscribe();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}
