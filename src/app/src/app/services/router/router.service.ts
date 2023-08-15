import { Injectable, Injector } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { BaseService } from '../base';
import { LoaderService } from '../loader';
import { LangService } from '../lang';
import { StorageService } from '../storage';
import { EventService } from '../event';
import { Location } from '@angular/common';
import { DomService } from '../dom';
import {
  CHECKOUT_SECTION_PARAM,
  PROJECTS,
  PROJECTS_OH,
  CONTACT,
  MY_GARDEN,
  MANIFESTO,
  LANDING_DRAFT,
  MY_ORDER,
  NAVIGATION_EVENTS,
  SEARCH,
  ADOPTIONS,
  BOXES,
  SUBSCRIPTION_BOX,
} from './router.constants';
import { Events } from '@enums/events.interface';
import { E_COMMERCE_ROUTES } from '../../modules/e-commerce/constant/routes.constant';

@Injectable({
  providedIn: 'root',
})
export class RouterService extends BaseService {
  static originalURL: { search: any; hash: string; href: string } = { search: {}, hash: '', href: '' };

  constructor(
    private router: Router,
    private loaderSrv: LoaderService,
    private langSrv: LangService,
    public injector: Injector,
    public eventSrv: EventService,
    private route: ActivatedRoute,
    private location: Location,
    public storageSrv: StorageService,
    public domSrv: DomService
  ) {
    super(injector);

    if (domSrv.isPlatformBrowser()) {
      RouterService.originalURL.href = window.location.href;
      RouterService.originalURL.hash = window.location.hash;
      for (const pair of window.location.search.split('?').pop().split('&')) {
        const members = pair.split('=').map((member) => member.trim());

        RouterService.originalURL.search[members[0].toLowerCase()] = members[1];
      }
    }
  }

  /**
   * Navigate to route
   */
  navigate(route: string, lang?: string, query?: any, data?: string, keepScrollStorage?: boolean): void {
    // Init inner loader
    this.eventSrv.dispatchEvent('loading-animation', { detail: { set: true } });

    // Handle data insertion
    const routeWithLanguage = `/${lang ? lang : this.langSrv.getCurrentLang()}/${route}`;
    const params = data ? [routeWithLanguage, data] : [routeWithLanguage];

    if (!keepScrollStorage) {
      this.storageSrv.clear('projectsScrollTo');
    }

    // handle query params
    // fragments now comes as queryParam
    const extra = {
      queryParams: null,
    };

    // Check if url has already queries on it
    // In example mails with utms
    let url: string;

    if (/\?/.test(params[0])) {
      const par = params[0].split('?');

      extra.queryParams = JSON.parse('{"' + par[1].replace(/&/g, '","').replace(/=/g, '":"') + '"}');
      url = par[0];
    }

    if (query) {
      extra.queryParams = {
        ...extra.queryParams,
        ...query,
      };
    }

    // Navigate
    if (url) {
      void this.router.navigate([url], extra);
    } else {
      void this.router.navigate(params, extra);
    }

    // Hide inner loader
    this.eventSrv.dispatchEvent('loading-animation', { detail: { set: false } });
  }

  /**
   * Navigate to order section
   */
  navigateToOrderSection(section: 'cart' | 'shipment' | 'payment'): void {
    this.navigate(`order/checkout?section=${section}`, this.langSrv.getCurrentLang(), null, null, true);
  }

  /**
   * middle function to redirect to multilingual urls not managed by slugs
   */

  navigateToSpecificUrl(url: string, query = null, isRoute?: boolean): string | void {
    let routesStack = {};

    // insert new multilingual urls stack
    switch (url) {
      case 'projects':
        routesStack = PROJECTS;
        break;
      case 'projectsOh':
        routesStack = PROJECTS_OH;
        break;
      case 'contact':
        routesStack = CONTACT;
        break;
    }
    if (isRoute) {
      return routesStack[this.langSrv.getCurrentLang()];
    } else {
      this.navigate(routesStack[this.langSrv.getCurrentLang()], null, query, null, true);
    }
  }

  /**
   * Get path of current url
   */
  getPath(getQueryParams = false): string {
    return getQueryParams ? this.router.url.split('?')[1] : this.router.url.split('?')[0];
  }

  /**
   * Gets if it's home
   */
  getIsHome(): boolean {
    return this.getPath().length <= 3;
  }

  getIsLandingDraft(): boolean {
    return this.removeUrlLang().split('/')[0] === LANDING_DRAFT;
  }

  getRouteFromURL(url: string, domain?: string): string {
    const link = url.split(domain);
    const removeLang = link[1].split('/');

    return removeLang[1];
  }

  setRouteToCurrentDomain(domain: string): string {
    const path = this.router.getCurrentNavigation().extractedUrl.toString();

    return domain + path;
  }

  getIsOrdersPath(): boolean {
    return this.getPath().includes(MY_ORDER);
  }

  getIsFarmersMarketAdoption(): boolean {
    return (
      this.removeUrlLang() === ADOPTIONS[this.langSrv.getCurrentLang()] || this.removeUrlLang() === PROJECTS[this.langSrv.getCurrentLang()]
    );
  }

  getIsFarmersMarketOverharvest(): boolean {
    return (
      this.removeUrlLang() === BOXES[this.langSrv.getCurrentLang()] || this.removeUrlLang() === PROJECTS_OH[this.langSrv.getCurrentLang()]
    );
  }

  /**
   * Gets if it's Farmers Market
   */
  getIsFarmersMarket(): boolean {
    return this.getIsFarmersMarketAdoption() || this.getIsFarmersMarketOverharvest();
  }

  public getIsMyGarden(): boolean {
    return this.removeUrlLang() === MY_GARDEN[this.langSrv.getCurrentLang()];
  }

  public getIsSearchResults(): boolean {
    return this.removeUrlLang() === SEARCH[this.langSrv.getCurrentLang()];
  }

  getCheckoutSection(): string {
    return this.route.snapshot.queryParamMap.get(CHECKOUT_SECTION_PARAM);
  }

  getIsAdoptionsOrBoxesPage(): boolean {
    const currentRemoveUrlLangValue = this.removeUrlLang();
    const currentLang = this.langSrv.getCurrentLang();

    return [ADOPTIONS[currentLang], BOXES[currentLang]].includes(currentRemoveUrlLangValue);
  }

  /**
   * Removes url lang to translate it in navigate function
   */
  removeUrlLang(urlProvide?: string): string {
    const url = urlProvide || this.getPath();

    if (url.length > 3) {
      const regExp = /\/[a-z]{2}\//;

      return url.replace(regExp, '');
    } else {
      return '/';
    }
  }

  /**
   * get the routes for the header menu
   */
  getMenuRoutes(withIcon: boolean = true): any[] {
    return [
      {
        text: 'global.my-garden.drop',
        route: 'private-zone/my-garden',
        active: false,
        id: 'my-garden',
        ...(withIcon && { icon: 'eva-home-outline' }),
        subText: 'See all your ups',
      },
      {
        text: 'page.orders.tab',
        route: 'private-zone/my-order',
        active: false,
        id: 'my-order',
        ...(withIcon && { icon: 'eva-shopping-bag-outline' }),
        boderbottom: true,
        subText: 'See your orders information',
      },
      {
        text: 'page.profile.button',
        route: 'private-zone/my-account',
        active: false,
        id: 'my-account',
        ...(withIcon && { icon: 'eva-person-outline' }),
        subText: 'You can update your information',
      },
      {
        text: 'global.Addresses.drop',
        route: 'private-zone/my-addresses',
        active: false,
        id: 'my-addresses',
        ...(withIcon && { icon: 'eva-pin-outline' }),
        subText: 'Manage all your directions',
      },
      {
        text: 'page.payment-mehods.title',
        route: 'private-zone/my-payments-methods',
        active: false,
        id: 'my-payments-methods',
        ...(withIcon && { icon: 'eva-credit-card-outline' }),
        boderbottom: true,
        subText: 'Manage all your payment methods',
      },
    ];
  }

  getFavouriteMenu(withIcon: boolean = true): any {
    return {
      text: 'global.favourites.text-info',
      route: 'private-zone/my-favourites',
      active: false,
      id: 'my-favourites',
      boderbottom: false,
      ...(withIcon && { icon: 'eva-heart-outline' }),
      subText: 'Your favourites',
    };
  }

  getDiscoveryBoxMenu(withIcon: boolean = true): any {
    return {
      text: 'discoverybox.global.subscription.title',
      route: 'private-zone/my-subscriptions',
      active: false,
      id: 'my-subscriptions',
      boderbottom: false,
      ...(withIcon && { icon: 'eva-refresh-outline' }),
      subText: 'Your subscriptions',
    };
  }

  /**
   * get the routes for the header farmers market menu
   */
  getFarmersMarketRoutes(withIcon: boolean = true, isDiscoveryBoxCountry?: boolean): any[] {
    const menuItems = [
      {
        text: 'global.adoptions.button',
        section: 'ADOPTION',
        active: false,
        id: 'adopt',
        ...(withIcon && { icon: 'eva-home-outline' }),
        boderbottom: true,
        subText: 'page.enjoy-adoptions.body',
      },
      {
        text: 'global.boxes.button',
        section: 'BOXES',
        active: false,
        id: 'tryABox',
        ...(withIcon && { icon: 'eva-shopping-bag-outline' }),
        subText: 'page.see-orders-information.text-info',
      },
    ];

    if (isDiscoveryBoxCountry) {
      menuItems.push({
        text: 'discoverybox.global.subscription.title',
        section: 'SUBSCRIPTION_BOX',
        active: false,
        id: 'subscribe',
        ...(withIcon && { icon: 'eva-shopping-bag-outline' }),
        subText: 'page.see-orders-information.text-info',
      });
    }

    return menuItems;
  }

  /**
   * navigates back to previous page
   */
  goBack(): void {
    this.location.back();
  }

  public navigateToFarmersMarket(section: string, queryParams?: any): void {
    const lang = this.langSrv.getCurrentLang();

    const route = (() => {
      switch (section) {
        case 'ADOPTION':
          return ADOPTIONS[lang];
        case 'BOXES':
          return BOXES[lang];
        case 'SUBSCRIPTION_BOX':
          return SUBSCRIPTION_BOX[lang];
        default:
          return null;
      }
    })();

    this.navigate(route, lang, queryParams);
  }

  /**
   * check country pop up urls
   */
  checkCountryPopup(): boolean {
    const isFarmerPage = this.getPath().includes('farmer');

    return this.getIsHome() || this.getIsFarmersMarket() || isFarmerPage;
  }

  /**
   * Auth guard for routes
   */
  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
    const path = route.url[0].path;
    const lang = route.params?.lang || this.langSrv.getCurrentLang();

    if (path && path === 'manifest') {
      return this.navigateToManifest(lang, path, route.queryParams);
    }

    return true;
  }

  navigateToManifest(lang?: string, originalPath?: string, queryParams?: any): boolean {
    lang = lang || this.langSrv.getCurrentLang();

    if (originalPath === 'manifest' && lang === 'de') {
      return true;
    }
    this.navigate(MANIFESTO[lang] || MANIFESTO.en, lang, queryParams);

    return false;
  }

  navigateToEcommerce(detail?: string): void {
    const lang = this.langSrv.getCurrentLang();
    const path = detail ? E_COMMERCE_ROUTES.MULTI_LANG_ROUTES[lang] + '/' + detail : E_COMMERCE_ROUTES.MULTI_LANG_ROUTES[lang];

    this.navigate(path);
  }

  public navigateToBlog(lang?: string, originalPath?: string, queryParams?: any): boolean {
    const path = 'blog';

    lang = lang || this.langSrv.getCurrentLang();

    if (originalPath === 'blog' && lang === 'de') {
      return true;
    }
    this.navigate(path, lang, queryParams);

    return false;
  }

  navigateToOrderList(isAllowed = true): void {
    const targetRoute = isAllowed ? 'private-zone/my-order/list' : 'login-register/login?uri=private-zone/my-order/list';

    this.navigate(targetRoute);
  }

  navigateByEvent(event: Events): void {
    this.navigate(NAVIGATION_EVENTS[event]);
  }

  navigateToCfFeedback(orderId: string): void {
    const route = `/private-zone/my-order/${orderId}/feedback`;

    this.navigate(route);
  }
}
