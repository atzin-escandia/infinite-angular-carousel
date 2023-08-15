import { Component, OnInit, Injector, ViewEncapsulation, OnDestroy } from '@angular/core';
import { PopoverBaseComponent } from '../base/base.component';
import { RouterService, AuthService, UserService, FavouriteService, ConfigService, StateService } from '../../services';
import { UserInterface } from '../../interfaces';
import { Subject, takeUntil, first, combineLatest, filter, tap } from 'rxjs';
import { SubscriptionBoxService } from '@app/pages/subscription-box/services';
import { DISCOVERY_BOX_VALID_COUNTRIES } from '@app/pages/subscription-box/constants/subscription-box.constants';

@Component({
  selector: 'private-mobile-menu',
  templateUrl: './private-mobile-menu.html',
  styleUrls: ['./private-mobile-menu.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PrivateMobileMenuComponent extends PopoverBaseComponent implements OnInit, OnDestroy {
  menuOptions = this.routerSrv.getMenuRoutes();
  onClose: (closeMobileMenu: boolean) => void;
  user: UserInterface;
  isTransitionLeftActive = false;
  isTransitionRightActive = false;
  isBackActive: boolean;
  destroy$ = new Subject<void>();

  constructor(
    public injector: Injector,
    private authSrv: AuthService,
    public routerSrv: RouterService,
    public userSrv: UserService,
    public favouriteSrv: FavouriteService,
    private configSrv: ConfigService,
    public subscriptionBoxSrv: SubscriptionBoxService,
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

  ngOnInit(): void {
    this.isTransitionRightActive = true;

    this.start({
      active: true,
      style: 'background-color: rgba(0,0,0,0);',
      close: () => {
        this.close();
      },
    });

    void this.getUser();

    this.menuOptions = this.menuOptions.map((o) => {
      o.active = this.utilsSrv.getFullUrl().includes(o.route.split('/')[1]) || false;

      return o;
    });

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

  logout(): void {
    this.onClose(false);
    this.close();
    this.authSrv.logout();
  }

  async getUser(): Promise<void> {
    this.user = await this.userSrv.get();
  }

  goToSection(option: any): void {
    this.routerSrv.navigate(option.route);
    this.onClose(true);
    this.close();
    this.utilsSrv.closeMobileMenu();
  }

  goBack(): void {
    this.isTransitionLeftActive = true;
  }

  closeModal(): void {
    this.utilsSrv.closeMobileMenu();
    this.onClose(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
