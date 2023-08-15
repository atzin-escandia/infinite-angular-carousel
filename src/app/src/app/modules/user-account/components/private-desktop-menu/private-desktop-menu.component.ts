import { Component, OnInit, Injector, OnDestroy } from '@angular/core';
import { BaseComponent } from '@app/components';
import { DISCOVERY_BOX_VALID_COUNTRIES } from '@app/pages/subscription-box/constants/subscription-box.constants';
import { SubscriptionBoxService } from '@app/pages/subscription-box/services';
import { RouterService, AuthService, UserService, EventService, FavouriteService, ConfigService, StateService } from '@app/services';
import { Subject, takeUntil, first, combineLatest, filter, tap } from 'rxjs';

@Component({
  selector: 'private-desktop-menu',
  templateUrl: './private-desktop-menu.component.html',
  styleUrls: ['./private-desktop-menu.component.scss'],
})
export class PrivateDesktopMenuComponent extends BaseComponent implements OnInit, OnDestroy {
  public menuOptions = this.routerSrv.getMenuRoutes();
  public currentOption: any = {};
  public mobileMenuIsOpen = false;
  public user: any;
  destroy$ = new Subject<void>();

  constructor(
    public injector: Injector,
    public authSrv: AuthService,
    public routerSrv: RouterService,
    private userSrv: UserService,
    public eventSrv: EventService,
    public favouriteSrv: FavouriteService,
    public subscriptionBoxSrv: SubscriptionBoxService,
    private configSrv: ConfigService,
    private stateSrv: StateService
  ) {
    super(injector);

    this.configSrv.isRemoteConfigLoaded$.pipe(first((val) => !!val)).subscribe(() => {
      favouriteSrv.favouriteUA$.pipe(takeUntil(this.destroy$)).subscribe((isActive) => {
        if (isActive) {
          this.menuOptions.splice(3, 0, this.routerSrv.getFavouriteMenu());
          this.menuOptions.join();
        }
      });
    });
  }

  async ngOnInit(): Promise<void> {
    // Get user info for username
    this.user = await this.userSrv.get(true);
    // Listens to private zone components to notice which one is open
    this.domSrv.addListener('window', 'private-zone-url', this.handlerUrlListener.bind(this));
    this.userSrv.getCurrent().subscribe((user) => (this.user = user));

    const firebaseUserArea$ = this.subscriptionBoxSrv.discoveryBoxUserAreaFirebase$;
    const currentCountry$ = this.stateSrv.$currentCountry;

    // Add Discovery Box Subscription option to menu
    combineLatest([firebaseUserArea$, currentCountry$])
      .pipe(
        takeUntil(this.destroy$),
        filter(([firebaseUserArea]) => firebaseUserArea === true),
        tap(([, country]) => {
          if (DISCOVERY_BOX_VALID_COUNTRIES.includes(country) && !this.menuOptions.find((item) => item.id === 'my-subscriptions')) {
            this.menuOptions.splice(4, 0, this.routerSrv.getDiscoveryBoxMenu());
            this.menuOptions.join();
          }
          if (!DISCOVERY_BOX_VALID_COUNTRIES.includes(country)) {
            this.menuOptions = this.menuOptions.filter((item) => item.id !== 'my-subscriptions');
          }
        })
      )
      .subscribe();
  }

  /**
   * Modifies component values when the url is changed (event)
   */
  public handlerUrlListener(e: any): void {
    // gets the current option
    this.menuOptions.filter((o) => {
      o.active = e.detail.router.includes(o.route.split('/')[1]) || false;
      if (o.active) {
        this.currentOption = o;
      }

      return o;
    });
    // gets if the open option is empty
    if (e.detail.content !== null) {
      this.currentOption.content = e.detail.content > 0;
    }
  }

  /**
   * Logout
   */
  public logout(): void {
    this.authSrv.logout();
  }

  /**
   * Navigation from menu
   */
  public navigate(route: string): void {
    this.eventSrv.dispatchEvent('private-zone-route', { route });
    this.routerSrv.navigate(route);
  }

  /**
   * unfolds mobile menu
   */
  public openMenu(): void {
    this.mobileMenuIsOpen = !this.mobileMenuIsOpen;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
