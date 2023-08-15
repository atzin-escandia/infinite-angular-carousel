import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MediatorsService } from '@app/mediators/mediators.service';
import { DISCOVERY_BOX_VALID_COUNTRIES } from '@app/pages/subscription-box/constants/subscription-box.constants';
import { SubscriptionBoxService } from '@app/pages/subscription-box/services';
import { VisitFromStorageKey } from '@enums/storage-key-visit-from.enum';
import { SORTING_FILTERS } from '@modules/farmers-market/constants/filters.constants';
import { FarmersMarketService } from '@modules/farmers-market/farmers-market.service';
import { FiltersService } from '@services/filters/filters.service';
import { SearchService } from '@services/search/search.service';
import { StateService } from '@services/state/state.service';
import { Observable, Subject, Subscription, combineLatest } from 'rxjs';
import { filter, first, map, mergeMap, switchMap, takeUntil, tap } from 'rxjs/operators';
import {
  AuthService,
  CartsService,
  ConfigService,
  CountryService,
  EventService,
  FavouriteService,
  ProjectsService,
  RouterService,
} from '../../services';
import { BaseComponent } from '../base';

@Component({
  selector: 'navbar-component',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavBarComponent extends BaseComponent implements OnInit, OnDestroy {
  // Navbar variables
  private cartSubscription: Subscription;
  public cartCounter = 0;
  public blogLang: string;
  public linksPrivateZone = this.routerSrv.getMenuRoutes(false);
  public linksFarmersMarket = this.routerSrv.getFarmersMarketRoutes(false);
  public farmerMaktOpen = false;
  public myAccountOpen = false;
  // Search bar
  public searchEmpty = true;
  public showSomeIdeas = true;
  public searchSuggestionsOpen = false;
  public suggestionsIdeasList: string[];
  public suggestionsList: string[];
  private areSuggestionsEnabled = false;
  public settingsMenuOpen = false;
  public searchInput = '';
  public languageSubscription: Subscription;
  // Country selector
  private countrySubscription: Subscription;
  public locationLangOpen = false;
  public country: string;
  private notAvailableCountrySubscription: Subscription = new Subscription();
  public hasNotAvailableCountry = false;
  public isMobile: boolean;
  public $showNavigation: Observable<boolean> = this.stateSrv.$showHeaderNavigation;
  public $showGreenBanner: Observable<boolean> = this.handleGreenBannerDisplay();
  isFirstLoad = true;
  destroy$ = new Subject<void>();

  constructor(
    public injector: Injector,
    public authSrv: AuthService,
    public routerSrv: RouterService,
    public searchSrv: SearchService,
    private cartSrv: CartsService,
    private countrySrv: CountryService,
    private stateSrv: StateService,
    private route: ActivatedRoute,
    public router: Router,
    private filtersSrv: FiltersService,
    private mediatorsSrv: MediatorsService,
    public projectsSrv: ProjectsService,
    public eventSrv: EventService,
    public farmersMarketSrv: FarmersMarketService,
    public favouriteSrv: FavouriteService,
    private configSrv: ConfigService,
    public subscriptionBoxSrv: SubscriptionBoxService
  ) {
    super(injector);

    this.configSrv.isRemoteConfigLoaded$.pipe(first((val) => !!val)).subscribe(() => {
      favouriteSrv.favouriteUA$.pipe(takeUntil(this.destroy$)).subscribe((isActive) => {
        if (isActive) {
          this.linksPrivateZone.splice(3, 0, this.routerSrv.getFavouriteMenu(false));
          this.linksPrivateZone.join();
        }
      });
    });
  }

  ngOnInit(): void {
    void this.loadOnInit();
    this.isMobile = this.domSrv.getIsDeviceSize();

    const currentCountry$ = this.stateSrv.$currentCountry;

    const firebaseMenu$ = this.configSrv.isRemoteConfigLoaded$.pipe(
      first((val) => !!val),
      switchMap(() => this.subscriptionBoxSrv.discoveryBoxMenuFirebase$)
    );

    // Add Discovery Box Subscription option to menu
    combineLatest([firebaseMenu$, currentCountry$])
      .pipe(
        takeUntil(this.destroy$),
        filter(([firebaseMenu]) => firebaseMenu),
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

  private async loadOnInit(): Promise<void> {
    this.route.queryParams.subscribe((params) => {
      const { q } = params;

      if (q) {
        this.searchInput = q;
        this.searchEmpty = false;
      }
    });

    this.cartCounter = this.cartSrv.get() ? this.cartSrv.get().length : 0;
    this.cartSubscription = this.cartSrv.getCounter().subscribe((counter) => (this.cartCounter = counter));
    this.country = this.storageSrv.get('location') || null;

    this.countrySrv
      .getCountriesLoaded()
      .pipe(first((val) => !!val))
      .subscribe(() => {
        this.countrySubscription = this.countrySrv.countryChange().subscribe((country) => {
          this.country = country;

          if (!this.isFirstLoad) {
            this.resetSearchBar();
            this.farmersMarketSrv.setSortingKey(SORTING_FILTERS.relevance.id);
          }
        });
      });
    this.hasNotAvailableCountry = await this.countrySrv.hasNotAvailableCountry();
    this.notAvailableCountrySubscription = this.mediatorsSrv
      .subscribeNotAvailableShipmentCountry()
      .subscribe((notAvailableShipmentCountry: boolean) => {
        this.hasNotAvailableCountry = notAvailableShipmentCountry;
      });
    this.setBlogLang(this.langSrv.getCurrentLang());
    this.languageSubscription = this.langSrv.getCurrent().subscribe((lang) => {
      this.setBlogLang(lang);
    });

    this.router.events.subscribe(() => {
      if (!this.routerSrv.getIsSearchResults() && !this.isFirstLoad) {
        this.resetSearchBar();
        this.searchSrv.searchOpen = false;
      }
    });

    this.isFirstLoad = false;
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.countrySubscription) {
      this.countrySubscription.unsubscribe();
    }
    if (this.notAvailableCountrySubscription) {
      this.notAvailableCountrySubscription.unsubscribe();
    }
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  checkIfMobileOpen(): void {
    this.utilsSrv.isMobileMenuOpen() ? this.utilsSrv.closeMobileMenu() : this.utilsSrv.openMobileMenu();
  }

  setBlogLang(lang: string): void {
    this.blogLang = lang;
    if (['nl', 'it', 'sv'].includes(lang)) {
      this.blogLang = 'en';
    }
  }

  openSettingsMenu(): void {
    this.utilsSrv.closeMobileMenu();
    this.popoverSrv.close();
    if (this.authSrv.isLogged()) {
      if (!this.settingsMenuOpen) {
        this.settingsMenuOpen = true;
        this.popoverSrv.open('PrivateMobileMenuComponent', 'header-notification-container', {
          inputs: {},
          outputs: {
            onClose: () => {
              this.popoverSrv.close('PrivateMobileMenuComponent');
              this.settingsMenuOpen = false;
            },
          },
        });
      } else {
        this.settingsMenuOpen = false;
      }
    } else {
      this.routerSrv.navigate('login-register', null, null, 'login');
    }
  }

  triggerSearch(): void {
    this.searchSrv.searchOpen = !this.searchSrv.searchOpen;
  }

  closeSearch(e?: boolean): void {
    this.searchEmpty = this.searchInput === '';

    if (e) {
      return;
    }
    if (!this.routerSrv.getIsSearchResults()) {
      this.searchSrv.searchOpen = false;
      this.searchSuggestionsOpen = false;
    }
  }

  async typeSearch(evt: any, searchInput: string): Promise<void> {
    this.searchInput = searchInput;

    if (evt.target.value === '') {
      this.searchEmpty = true;
    } else {
      this.searchEmpty = false;

      if (evt.target.value.length >= 4 && this.areSuggestionsEnabled) {
        const results = await this.searchSrv.predictive(this.searchInput);

        this.showSomeIdeas = false;

        this.searchSuggestionsOpen = true;
        this.filterOptions(evt.target.value, results);
      } else if (evt.target.value.length < 4 && evt.inputType === 'deleteContentBackward') {
        this.searchEmpty = true;
        this.searchSuggestionsOpen = false; // Remove when someideas future development
        this.showSomeIdeas = false; // True when someideas future development
      }
    }
  }

  searchIdeas(evt: any): void {
    this.suggestionsIdeasList = [
      // Future request development
      'Naranja',
    ];
    this.searchSuggestionsOpen = true;
    this.showSomeIdeas = evt.target.value === '';
  }

  private filterOptions(searchQuery: string, results: any): void {
    const searchQueryFormatted = searchQuery.toLowerCase();

    // create innerHTML to format bold string
    this.suggestionsList = results.map(
      (sugg) =>
        sugg.substring(0, sugg.toLowerCase().indexOf(searchQueryFormatted)) +
        '<b>' +
        sugg.substring(
          sugg.toLowerCase().indexOf(searchQueryFormatted),
          sugg.toLowerCase().indexOf(searchQueryFormatted) + searchQueryFormatted.length
        ) +
        '</b>' +
        sugg.substring(sugg.toLowerCase().indexOf(searchQueryFormatted) + searchQueryFormatted.length, sugg.length)
    );
  }

  showMore(deleteGoogleSearchParam = false): void {
    const googleSearchParam = deleteGoogleSearchParam ? null : this.searchInput;

    !deleteGoogleSearchParam && this.closeSearch();

    if (deleteGoogleSearchParam) {
      this.filtersSrv.emitResetFilters();
    } else {
      const params = { ...this.route.snapshot.queryParams };

      params.q = googleSearchParam;

      // reset pagination
      delete params.adoptionsPage;
      delete params.boxesPage;

      this.routerSrv.navigate('/search', null, params);
    }
  }

  getRoute(link: string): any {
    return this.routerSrv.navigateToSpecificUrl(link, null, true);
  }

  searchSuggestion(searchInput: string): void {
    if (searchInput) {
      this.searchInput = searchInput.replace(/<{1}[^<>]{1,}>{1}/g, '').toLowerCase();
      this.searchEmpty = true;
      this.showMore();
    }
  }

  goToCart(): void {
    this.utilsSrv.closeMobileMenu();
    this.popoverSrv.close();
    this.routerSrv.navigateToOrderSection('cart');
  }

  closePopover(): void {
    this.utilsSrv.closeMobileMenu();
    this.popoverSrv.close();
  }

  handleDrop(isActive: boolean, dropdownID: string, extra?: any): void {
    this[dropdownID] = isActive;

    if (extra && extra.section) {
      this.routerSrv.navigateToFarmersMarket(extra.section);
    }
  }

  locationAndLanguage(): void {
    if (!this.locationLangOpen) {
      this.locationLangOpen = true;

      this.popoverSrv.open(
        'LocationLangComponent',
        'navbar-location',
        {
          inputs: {},
          outputs: {
            onClose: (changedCountry: boolean): void => {
              if (this.hasNotAvailableCountry && changedCountry) {
                this.storageSrv.set(VisitFromStorageKey.notAvailableShipmentCountry, false);
                this.hasNotAvailableCountry = false;
              }
              this.popoverSrv.close('LocationLangComponent');
              this.locationLangOpen = false;
            },
          },
        },
        true,
        true
      );
    } else {
      this.popoverSrv.close('LocationLangComponent');
      this.locationLangOpen = false;
    }
  }

  resetSearchBar(): void {
    this.searchInput = '';
    this.searchSuggestionsOpen = false;
    this.searchEmpty = true;
    this.showMore(true);

    this.farmersMarketSrv.setCurrentFiltersKey({ categories: [], countries: [], seals: [] });

    if (this.routerSrv.getIsSearchResults()) {
      const params = { ...this.route.snapshot.queryParams };

      delete params.q;
      delete params.adoptionsPage;
      delete params.boxesPage;

      this.routerSrv.navigate('/search', null, params);
    }
  }

  private handleGreenBannerDisplay(): Observable<boolean> {
    return this.stateSrv.$showGreenBanner.pipe(
      mergeMap((showGreenBanner) =>
        this.stateSrv.$showHeaderNavigation.pipe(map((showHeaderNavigation) => showGreenBanner && showHeaderNavigation))
      )
    );
  }
}
