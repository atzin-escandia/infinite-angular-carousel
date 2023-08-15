/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/unbound-method */
import { Inject, Injectable, Injector, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { BaseService } from '../base';
import { RouterService } from '../router';
import { environment } from '../../../environments/environment';
import { StorageService } from '../storage';
import { DEFAULT_LIST_NAME, TrackingConstants } from './tracking.constants';
import { UtilsService } from '../utils';
import { CountryService } from '../country';
import { DomService } from '../dom';
import { fromEvent, Subscription } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Router } from '@angular/router';

import { ConfigService } from '../config/config.service';
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';
import { CardService } from '@app/modules/farmers-market/services/card.service';
import { first } from 'rxjs/operators';
import { REMOTE_CONFIG } from '@app/constants/remote-config.constants';
import { IEcommerceTracking, UnknownObjectType } from '@app/interfaces';

declare const window: any;

@Injectable({
  providedIn: 'root',
})
export class TrackingService extends BaseService implements OnDestroy {
  private enabled: any = {};
  private isTAPIEnabled: boolean;
  private enableAnalytics = false;
  private interimlList: string;
  private interimGA4lList: string;
  private tapi: any = null;
  private LogRocket: any;
  private targetingCookiesAccepted = false;
  private tapiLoaded = false;
  private cookiesEvent = 'TargetingCookiesAccepted';
  private remoteConfigSubscription: Subscription;
  private hotjarSubscription: Subscription;
  private logRocketSubscription: Subscription;
  private isHotjarActive: boolean;
  private isLogRocketActive: boolean;
  // TradeDoubler
  private tradeDoublerSubscription: Subscription;
  private country: string;
  private tradeDoublerRemoteConfig: tradeDoublerRemoteConfig;
  private isTradeDoublerEnabled: boolean;
  private isTradeDoublerLoaded = false;
  private tradeDoublerContainerCode: string;
  private TDConf: any = {};
  private tduid: string;
  private countrySubscription: Subscription;
  private position = 0;

  constructor(
    public injector: Injector,
    private cardSrv: CardService,
    private storageSrv: StorageService,
    private utilsSrv: UtilsService,
    private countrySrv: CountryService,
    private configSrv: ConfigService,
    private domSrv: DomService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {
    super(injector);
  }

  /**
   * Init analytics service only when isPlatformBrowser
   */
  init(): void {
    if (!this.domSrv.isPlatformBrowser()) {
      return;
    }

    this.country = this.countrySrv.getCountry();
    this.createCountrySubscription();
    this.createRemoteConfigSubscription();
    this.enableAnalytics = environment.analytics?.active || false;
    this.isTAPIEnabled = environment.tapi?.active || false;
    // User previously check targeting cookies 'insta' loaded (OneTrust)
    this.targetingCookiesAccepted = this.storageSrv.get(this.cookiesEvent, 2);
    if (this.targetingCookiesAccepted) {
      this.checkTAPIAndRecordings();
      this.refreshTradeDoublerConfig();
    } else {
      // first time when user clicks the button (OneTrust)
      fromEvent(window, this.cookiesEvent).subscribe(() => {
        this.storageSrv.set(this.cookiesEvent, true, 0, null, 2);
        this.targetingCookiesAccepted = true;
        this.checkTAPIAndRecordings();
        this.refreshTradeDoublerConfig();
      });
    }

    if (this.enableAnalytics) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const me = this;

      setTimeout(() => {
        this.loadGTMScript(me);
        this.initCoreWebVitalsReporting();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.hotjarSubscription?.unsubscribe();
    this.logRocketSubscription?.unsubscribe();
    this.remoteConfigSubscription?.unsubscribe();
    this.tradeDoublerSubscription?.unsubscribe();
    this.countrySubscription?.unsubscribe();
  }

  /**
   * Handler for cookie manage
   */
  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.targetingCookiesAccepted) {
      this.checkActivateRecordings(state.url);
    }

    return true;
  }

  /**
   * Handler for cookie manage
   */
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

  /**
   * Track event using GTM and datalayer
   */
  trackEvent(event: string, ecommerce: boolean = false, data?: any, action?: string, extraEcommerce?: any): void {
    // UA Switched off
    // return;

    // TODO: clean all UA old code all around the codebase when UA is Switched off
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const me = this;

    setTimeout(() => {
      if (me.enableAnalytics) {
        // Init default params
        let params: any = {
          event,
        };

        // If data needs to be placed out of ecommerce object
        if (extraEcommerce) {
          params = {
            event,
            ...extraEcommerce,
          };
        }

        // If ecommerce add default currency and data
        if (ecommerce) {
          const country = me.countrySrv.getCurrentCountry();

          params.ecommerce = {
            currencyCode: country && country.currency ? country.currency : 'EUR',
            ...data,
          };
        } else if (data) {
          params = {
            event,
            ...data,
          };
        }

        // Add action if provided
        if (action) {
          params.action = action;
        }
        // Add params to dataLayer to track it
        window.dataLayer?.push(params);
      }

      try {
        if (me.tapi) {
          void me.asyncTrackEvent(event, data);
        }
      } catch (error) {
        console.error(error);
      }
    }, 0);
  }

  /**
   * Track event using GTM GA4 and datalayer
   */
  // trackEventGA4(event: string, eventParameters?: UnknownObjectType): void {
  trackEventGA4(event: string, ecommerce: boolean = false, data?: UnknownObjectType, extraData?: UnknownObjectType): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const me = this;

    setTimeout(() => {
      if (me.enableAnalytics) {
        // Init default params
        let params: any = {
          event,
        };

        // If data needs to be placed out of ecommerce object
        if (extraData) {
          params = {
            event,
            ...extraData,
          };
        }

        // If ecommerce add default currency and data
        if (ecommerce) {
          window.dataLayer.push({ ecommerce: null }); // Clear the previous ecommerce object.
          params.ecommerce = {
            ...(data as IEcommerceTracking),
          };
        } else if (data) {
          params = {
            event,
            ...data,
          };
        }

        // Add params to dataLayer to track it
        window.dataLayer?.push(params);
      }

      try {
        if (me.tapi) {
          void me.asyncTrackEvent(event, data);
        }
      } catch (error) {
        console.error(error);
      }
    }, 0);
  }

  async loadLogRocket(logRocket: any): Promise<any> {
    this.LogRocket = await import('logrocket');
    this.LogRocket.default.init(logRocket.apiKey);

    return this.LogRocket.default;
  }

  /**
   * Overwrite agroupation
   */
  addGroup(pageType: string, farmer: string): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const me = this;

    setTimeout(() => {
      if (me.enableAnalytics) {
        window.dataLayer?.push({
          event: TrackingConstants.GTM.EVENTS.CONTENT,
          pageType,
          farmer,
        });
      }
    }, 0);
  }

  setInterimList(name: string): void {
    this.interimlList = name;
  }

  setInterimGA4List(name: string): void {
    this.interimGA4lList = name;
  }

  getPosition(): number {
    return this.position;
  }

  setPosition(position: number): void {
    this.position = position;
  }

  getInterimList(): string {
    return this.interimlList;
  }

  getInterimGA4List(): string {
    return this.interimGA4lList;
  }

  buildListName(list: string = DEFAULT_LIST_NAME, prefix: string = ''): string {
    return (prefix + list?.charAt(0).toUpperCase() + list?.slice(1)).replace(/ /g, '_');
  }

  saveTrackingStorageProject(key: string, project: IEcommerceTracking): void {
    this.storageSrv.set(key, project);
  }

  deleteTrackingStorageProject(key: string): void {
    this.storageSrv.clear(key);
  }

  setTradeDoublerProjects(projects: any): void {
    if (!this.targetingCookiesAccepted || !this.isTradeDoublerLoaded) {
      return;
    }

    const productsMap = [];

    if (projects?.length > 0) {
      this.TDConf = this.TDConf || {};
      this.TDConf.Config = {
        containerTagId: this.tradeDoublerContainerCode,
      };

      for (const product of projects) {
        productsMap.push({
          id: product.masterBox?.id,
          price: this.cardSrv.getPrice(product),
          name: product.masterBox?._m_name?.en,
        });
      }

      this.TDConf.Config.projects = productsMap;
      this.TDConf.Config.Category_name = this.cardSrv.getType();
    }
  }

  setTradeDoublerUPDetail(cardInfo: any): void {
    if (!this.targetingCookiesAccepted || !this.isTradeDoublerLoaded) {
      return;
    }

    this.TDConf = this.TDConf || {};
    this.TDConf.Config = {
      containerTagId: this.tradeDoublerContainerCode,
    };

    this.TDConf.Config = {
      productId: cardInfo?.up?.masterBox?._id,
      category: cardInfo?.up?.category,
      brand: cardInfo?.farmer?.company?.brandName,
      productName: cardInfo?.up?.masterBox?._m_name?.en,
      productDescription: cardInfo?.up?.masterBox?._m_publicName?.en,
      price: cardInfo?.price?.amount,
      currency: cardInfo?.price?.currency?.farmer?.currency,
      url: cardInfo?.up?.slug,
      imageUrl: cardInfo?.up?.masterBox?.pictureURL,
      containerTagId: this.tradeDoublerContainerCode,
    };

    try {
      const TDAsync = this.document.createElement('script');

      TDAsync.src = `//swrap.tradedoubler.com/wrap?id=${this.TDConf.Config.containerTagId as string}`;
      TDAsync.async = true;
      this.document.body.appendChild(TDAsync);
    } catch (error) {
      console.error('TradeDoubler: setTradeDoublerUPDetail');
      console.error(error);
    }
  }

  setTradeDoublerOHDetail(cardInfo: any): void {
    if (!this.targetingCookiesAccepted || !this.isTradeDoublerLoaded) {
      return;
    }

    this.TDConf = this.TDConf || {};
    this.TDConf.Config = {
      containerTagId: this.tradeDoublerContainerCode,
    };

    this.TDConf.Config = {
      productId: cardInfo?.up?._id?.toString(),
      category: cardInfo?.up?.category,
      brand: cardInfo?.farmer?.company?.brandName,
      productName: cardInfo?.up?.code,
      productDescription: cardInfo?.up?._m_production?.en,
      price: cardInfo?.price?.amount,
      currency: cardInfo?.price?.currency?.farmer?.currency,
      url: cardInfo?.up?.slug,
      imageUrl: cardInfo?.up?.pictureURL,
      containerTagId: this.tradeDoublerContainerCode,
    };

    try {
      const TDAsync = this.document.createElement('script');

      TDAsync.src = `//swrap.tradedoubler.com/wrap?id=${this.TDConf.Config.containerTagId as string}`;
      TDAsync.async = true;
      this.document.body.appendChild(TDAsync);
    } catch (error) {
      console.error('TradeDoubler: setTradeDoublerOHDetail');
      console.error(error);
    }
  }

  // eslint-disable-next-line max-lines-per-function
  tradeDoublerConfirmation(products: any, lastPayment: any): void {
    if (!this.targetingCookiesAccepted || !this.isTradeDoublerLoaded) {
      return;
    }

    const validCountries = this.getTradeDoublerValidCountries();

    const country = this.storageSrv.get('location');
    const containerTagId = this.getTDCointainerId;

    if (!country || !validCountries.includes(country) || !this.tduid || !this.targetingCookiesAccepted || !containerTagId) {
      return;
    }

    // CONTAINER TAG
    this.TDConf = this.TDConf || {};

    const productsMap = [];

    if (products?.length > 0) {
      for (const product of products) {
        productsMap.push({
          id: product._masterBox,
          price: product.price,
          name: product.masterBox?._m_name?.en,
          qty: product.numMasterBoxes || product.stepMS,
        });
      }
    }

    this.TDConf.Config = {
      products: productsMap,
      orderId: lastPayment?.purchase?.payment?.intentInfo?.id || lastPayment?.purchase?.payment?.stripeId,
      orderValue: lastPayment?.purchase?.payment?.amount,
      currency:
        lastPayment?.purchase?.payment?.intentInfo?.currency?.toUpperCase() || lastPayment?.purchase?.payment?.currency?.toUpperCase(),
      containerTagId,
    };

    try {
      const TDAsync = this.document.createElement('script');

      TDAsync.src = '//swrap.tradedoubler.com/wrap?id=' + this.TDConf.Config.containerTagId;
      TDAsync.async = true;
      this.document.body.appendChild(TDAsync);
    } catch (error) {
      console.error('TDAsync script');
      console.error(error);
    }

    try {
      // TD CUSTOM PIXEL
      const PixTD: HTMLIFrameElement = this.document.createElement('iframe');

      PixTD.src =
        'https://tbs.tradedoubler.com/report?organization=2337787&event=431417&orderNumber=' +
        this.TDConf.Config.orderId +
        '&orderValue=' +
        this.TDConf.Config.orderValue +
        '&currency=' +
        this.TDConf.Config.currency +
        '&type=iframe&tduid=' +
        this.tduid;
      PixTD.width = '1';
      PixTD.height = '1';
      // PixTD.async = true;
      PixTD.style.visibility = 'hidden';

      this.document.body.appendChild(PixTD);
    } catch (error) {
      console.error('PixTD iframe');
      console.error(error);
    }

    try {
      // ANTIADBLOCKER PIXEL
      const PixTDadblock: HTMLImageElement = this.document.createElement('img');

      PixTDadblock.src =
        'https://img-statics.com/report?o=2337787&e=431417&ordnum=' +
        this.TDConf.Config.orderId +
        '&ordval=' +
        this.TDConf.Config.orderValue +
        '&curr=' +
        this.TDConf.Config.currency +
        '&tduid=' +
        this.tduid;
      PixTDadblock.width = 1;
      PixTDadblock.height = 1;
      // PixTDadblock.async = true;
      PixTDadblock.style.visibility = 'hidden';

      this.document.body.appendChild(PixTDadblock);
    } catch (error) {
      console.error('PixTDadblock img');
      console.error(error);
    }
  }

  private checkTAPIAndRecordings(): void {
    if (!this.targetingCookiesAccepted) {
      return;
    }
    if (this.isTAPIEnabled && !this.tapiLoaded) {
      this.loadTAPI();
    }
    this.checkActivateRecordings(this.router.url);
  }

  private checkTradeDoubler(): void {
    if (
      this.targetingCookiesAccepted &&
      this.isTradeDoublerEnabled &&
      !this.isTradeDoublerLoaded &&
      this.tradeDoublerContainerCode &&
      this.country &&
      this.tduid &&
      this.getTradeDoublerValidCountries().includes(this.country)
    ) {
      this.loadTradeDoubler();
    } else {
      // reset TradeDoubler config
      this.TDConf = {};
    }
  }

  private initTradeDoublerConfig(): void {
    this.isTradeDoublerEnabled = this.tradeDoublerRemoteConfig?.active || false;
    this.tradeDoublerContainerCode = this.tradeDoublerRemoteConfig?.containers[this.country];
    this.isTradeDoublerLoaded = false;
    this.tduid = this.storageSrv.getCookie('tduid');
  }

  private initCoreWebVitalsReporting(): void {
    getCLS(this.reportCoreWebVital);
    getFID(this.reportCoreWebVital);
    getLCP(this.reportCoreWebVital);
    getFCP(this.reportCoreWebVital);
    getTTFB(this.reportCoreWebVital);
  }

  private reportCoreWebVital(vital: any): void {
    const cwv = {
      event: 'coreWebVitals',
      webVitalsMeasurement: {
        id: vital.id,
        name: vital.name,
        valueRounded: Math.round(vital.name === 'CLS' ? vital.value * 1000 : vital.value),
      },
    };

    window.dataLayer.push(cwv);
  }

  /**
   * Get if service is enabled
   */
  private getIsEnabled(service: string): boolean {
    return this.enabled[service] || false;
  }

  /**
   * Load hotjar script
   */
  private loadHotjar(): void {
    // Check hotjar
    this.configSrv
      .getValue(REMOTE_CONFIG.HOTJAR)
      .pipe(first((val) => !!val))
      .subscribe((hotjar) => {
        hotjar = JSON.parse(hotjar._value);

        if (typeof window !== 'undefined' && hotjar && hotjar.active && !this.enabled.HJ) {
          ((c, f, e: string, v: string) => {
            c.hj =
              c.hj ||
              (() => {
                // eslint-disable-next-line prefer-rest-params
                (c.hj.q = c.hj.q || []).push(arguments);
              });
            c._hjSettings = { hjid: hotjar.id, hjsv: hotjar.sv };
            const n: any = f.getElementsByTagName('head')[0];
            const t: any = f.createElement('script');

            t.async = 1;
            t.src = e + String(c._hjSettings.hjid) + v + String(c._hjSettings.hjsv);
            n.appendChild(t);
          })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');

          this.enabled.HJ = true;
        }
      });
  }

  /**
   * Load GTM script
   */
  private loadGTMScript(me): void {
    if (typeof window !== 'undefined' && me.enableAnalytics && !me.enabled.GTM) {
      if (!window.dataLayer && !window.GTM) {
        window.dataLayer = window.dataLayer || [];

        ((w, d, s, l, i) => {
          w[l] = w[l] || [];
          w[l].push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js',
          });

          const f = d.getElementsByTagName(s)[0];
          const j: any = d.createElement(s);
          const dl = l !== 'dataLayer' ? '&l=' + l : '';

          j.async = true;
          j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
          if (environment.env && environment.env !== 'pro') {
            j.src += `&gtm_auth=${environment.analytics?.gtm_auth}&gtm_preview=${environment.analytics?.gtm_preview}`;
            j.src += '&gtm_cookies_win=x';
          }
          f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', environment.analytics?.gtm);

        // Create block for users without javascript active
        const gtagNoscript = document.createElement('noscript');
        const gtagIframe: any = document.createElement('iframe');

        gtagIframe.src = 'https://www.googletagmanager.com/ns.html?id=' + environment.analytics?.gtm;
        if (environment.env && environment.env !== 'pro') {
          gtagIframe.src += `&gtm_auth=${environment.analytics?.gtm_auth}&gtm_preview=${environment.analytics?.gtm_preview}`;
          gtagIframe.src += '&gtm_cookies_win=x';
        }
        gtagIframe.width = '0';
        gtagIframe.height = '0';
        gtagIframe.style = 'display:none;visibility:hidden';

        gtagNoscript.appendChild(gtagIframe);
        document.body.appendChild(gtagNoscript);

        window.GTM = environment.analytics?.gtm;

        me.enabled.GTM = true;
      }
    }
  }

  private loadTAPI(): void {
    this.utilsSrv.loadScript({
      src: environment.tapi.library,
      defer: true,
      async: true,
      onload: this.onTapiLoad.bind(this),
    });
  }

  private async onTapiLoad(): Promise<void> {
    const { email, country } = await this.getUserInfo();

    this.tapi = window.tapi;
    this.tapi.setupFBPixel(environment.tapi.name, {
      fbc: RouterService.originalURL.search.fbclid,
      email,
      country,
      dictionary: {
        // eslint-disable-next-line id-blacklist
        any: {
          keys: {
            email: 'em',
          },
          values: {},
        },
      },
    });
    if (RouterService.originalURL.search.fbtest) {
      this.tapi.debug({ fbTestId: RouterService.originalURL.search.fbtest, verbose: true, debugger: true });
    }

    this.tapi
      .newRule('pageView')
      .url()
      .sendEvent('PageView', () => this.getUserInfo())
      .sendPixel();
    this.tapi
      .newRule('startPurchase')
      .click()
      .id()
      .or()
      .is('adopt-page-top-adopt-btn')
      .or()
      .is('adopt-page-bottom-adopt-btn')
      .or()
      .is('adopt-page-bottom-oh-btn')
      .or()
      .is('adopt-page-top-oh-btn')
      .or()
      .is('oh-page-top-oh-btn')
      .or()
      .is('oh-page-bottom-oh-btn')
      .or()
      .is('oh-garden')
      .sendEvent('Start Purchase', () => this.getUserInfo())
      .sendPixel();

    this.tapiLoaded = true;
  }

  private getUserInfo(): any {
    const userInfo: any = {};
    const user = this.storageSrv.getCurrentUser();

    if (user !== null) {
      userInfo.email = user.email;
      if (user.addresses && Array.isArray(user.addresses)) {
        userInfo.country = user.addresses.find((address) => !!address.country).country;
      }
    }

    return userInfo;
  }

  private async asyncTrackEvent(event: any, data: any = {}, attempts: number = 1): Promise<any> {
    let userInfo = {};

    try {
      userInfo = await this.getUserInfo();
    } catch (error) {
      if (event === TrackingConstants.GTM.EVENTS.REGISTER && attempts < 3) {
        // the register event is tracked before any information from user exists
        return setTimeout(() => this.asyncTrackEvent(event, data, attempts + 1), 1000 * attempts);
      }
    }
    if (data.add) {
      for (const vars of data.add.products) {
        this.tapi.sendEvent('AddToCart', { ...vars, ...userInfo }).sendPixel();
      }
    }

    if (data.detail) {
      for (const vars of data.detail.products) {
        this.tapi.sendEvent('ViewContent', { ...vars, ...userInfo }).sendPixel();
      }
    }
    if (data.purchase) {
      this.tapi
        .sendEvent('Purchase', {
          stripe: data.purchase.actionField.id,
          content_ids: data.purchase.products.map((product) => product.id + (product.variant === 'OH' ? '-oh' : '-ad')),
          revenue: data.purchase.actionField.revenue,
          products: data.purchase.products,
          ...userInfo,
        })
        .sendPixel();
    }
    if (event === TrackingConstants.GTM.EVENTS.REGISTER) {
      this.tapi.sendEvent('CompleteRegistration', { ...data, ...userInfo }).sendPixel();
    }
    if (event === TrackingConstants.GTM.EVENTS.LOGIN) {
      this.tapi.sendEvent('Login', { ...data, ...userInfo }).sendPixel();
    }
  }

  private checkActivateRecordings(url: string): boolean {
    // Check hotjar & LogRocket
    this.createHotjarSubscription(url);
    this.createLogRocketSubscription(url);

    return true;
  }

  // Hotjar
  private createHotjarSubscription(url: string): void {
    this.hotjarSubscription = this.configSrv.getValue(REMOTE_CONFIG.HOTJAR).subscribe((hotjar) => {
      try {
        hotjar = hotjar ? JSON.parse(hotjar._value) : null;
        this.isHotjarActive = !!(hotjar?.active && hotjar?.routes?.length > 0);
        if (this.isHotjarActive && !this.getIsEnabled('HJ')) {
          for (const routeUrl of hotjar.routes) {
            if (hotjar.exactRoute) {
              if (url.endsWith(routeUrl)) {
                void this.loadHotjar();
                break;
              }
            } else {
              if (url.includes(routeUrl)) {
                void this.loadHotjar();
                break;
              }
            }
          }
        }
      } catch (error) {
        // Just caught
      }
    });
  }

  // LogRocket
  private createLogRocketSubscription(url: string): void {
    this.logRocketSubscription = this.configSrv
      .getValue(REMOTE_CONFIG.LOG_ROCKET)
      .pipe(first((val) => !!val))
      .subscribe((logRocket) => {
        try {
          logRocket = logRocket ? JSON.parse(logRocket._value) : null;
          this.isLogRocketActive = !!(logRocket?.active && logRocket?.routes?.length > 0);
          if (this.isLogRocketActive) {
            for (const routeUrl of logRocket.routes) {
              if (logRocket.exactRoute) {
                if (url.endsWith(routeUrl)) {
                  void this.loadLogRocket(logRocket);
                  break;
                }
              } else {
                if (url.includes(routeUrl)) {
                  void this.loadLogRocket(logRocket);
                  break;
                }
              }
            }
          }
        } catch (error) {
          // Just caught
        }
      });
  }

  private createCountrySubscription(): void {
    this.countrySubscription = this.countrySrv.countryChange().subscribe((newCountry): void => {
      if (!this.getTradeDoublerValidCountries().includes(newCountry)) {
        return;
      }
      this.country = newCountry;
      this.refreshTradeDoublerConfig();
    });
  }

  private createRemoteConfigSubscription(): void {
    this.remoteConfigSubscription = this.configSrv.isRemoteConfigLoaded$
      .pipe(first((val) => !!val))
      .subscribe(() => this.createTradeDoublerSubscription());
  }

  private getTDCointainerId(): string {
    return this.tradeDoublerContainerCode;
  }

  private createTradeDoublerSubscription(): void {
    this.tradeDoublerSubscription = this.configSrv.getValue(REMOTE_CONFIG.TRADE_DOUBLER).subscribe(({ _value }) => {
      if (_value) {
        this.tradeDoublerRemoteConfig = _value ? JSON.parse(_value) : null;
        this.refreshTradeDoublerConfig();
      }
    });
  }

  private getTradeDoublerValidCountries(): string[] {
    if (!this.tradeDoublerRemoteConfig) {
      return [];
    }

    return Object.keys(this.tradeDoublerRemoteConfig?.containers) || [];
  }

  private refreshTradeDoublerConfig(): void {
    if (this.configSrv.isRemoteConfigLoaded) {
      this.initTradeDoublerConfig();
      this.checkTradeDoubler();
    }
  }

  private loadTradeDoubler(): void {
    if (!this.targetingCookiesAccepted || !this.tduid) {
      return;
    }

    this.TDConf = this.TDConf || {};
    this.TDConf.Config = {
      containerTagId: this.tradeDoublerContainerCode,
    };

    try {
      const TDAsync = this.document.createElement('script');

      TDAsync.src = '//swrap.tradedoubler.com/wrap?id=' + this.TDConf.Config.containerTagId;
      TDAsync.async = true;
      TDAsync.onload = () => {
        this.isTradeDoublerLoaded = true;
      };
      this.document.body.appendChild(TDAsync);
    } catch (error) {
      console.error('TDAsync script');
      console.error(error);
    }
  }
}

interface tradeDoublerRemoteConfig {
  active: boolean;
  containers: { [countryCode: string]: string };
}
