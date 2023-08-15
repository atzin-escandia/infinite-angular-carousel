import { Injector } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import {
  LoaderService,
  TextService,
  UserService,
  CountryService,
  SeoService,
  DomService,
  RouterService,
  UtilsService,
  LangService,
  StorageService,
  EventService,
  FavouriteService,
} from '../../services';

import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import { PopupService } from '../../services/popup';
import { PopoverService } from '../../services/popover';
import { LoggerService } from '@app/services';
import { ForgotPasswordPopupComponent } from '../../popups/forgot-password';
import { GenericPopupComponent } from '../../popups/generic-popup';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { Response as Response_2 } from 'express';
import { StatusPopupComponent } from '@popups/status-popup';
import { LoginPopupComponent } from '@app/popups/login-popup/login-popup.component';

export abstract class BasePage {
  public seoSrv: SeoService;
  public loaderSrv: LoaderService;
  public langSrv: LangService;
  public textSrv: TextService;
  public domSrv: DomService;
  public routerSrv: RouterService;
  public utilsSrv: UtilsService;
  public route: ActivatedRoute;
  public router: Router;
  public storageSrv: StorageService;
  public popupSrv: PopupService;
  public popoverSrv: PopoverService;
  public eventSrv: EventService;
  public loggerSrv: LoggerService;
  public _response: Response_2;
  public env = environment;

  // Load shares services
  public userService: UserService;
  public countrySrv: CountryService;
  public userSub: Subscription;
  public favouriteService: FavouriteService;

  // Public and global data from other pages
  public user: any;
  public countries: any;
  public countriesByIso: any = {};

  private _lastComponentNavegate = '';

  public app = false;

  constructor(public injector: Injector) {
    this.loaderSrv = this.injector.get(LoaderService);
    this.textSrv = this.injector.get(TextService);
    this.route = this.injector.get(ActivatedRoute);
    this.router = this.injector.get(Router);
    this.userService = this.injector.get(UserService);
    this.countrySrv = this.injector.get(CountryService);
    this.seoSrv = this.injector.get(SeoService);
    this.langSrv = this.injector.get(LangService);
    this.domSrv = this.injector.get(DomService);
    this.routerSrv = this.injector.get(RouterService);
    this.utilsSrv = this.injector.get(UtilsService);
    this.eventSrv = this.injector.get(EventService);
    this.storageSrv = this.injector.get(StorageService);
    this.popupSrv = this.injector.get(PopupService);
    this.popoverSrv = this.injector.get(PopoverService);
    this.loggerSrv = this.injector.get(LoggerService);
    this.favouriteService = this.injector.get(FavouriteService);

    this.execute301redir();

    // Set SEO data
    this.setSeo();
    void this.loadUser();
    this.interceptorHash();
    this.initLangHadnler();
    void this.loadCountries();
    this.initUserHandler();
    this.interceptorUrl();
    this.langSrv.getCurrent().subscribe(() => {
      void this.loadCountries();
    });
  }

  private execute301redir(): void {
    if (!this.domSrv.isPlatformBrowser()) {
      this.route.params.subscribe(params => {
        if (params.cfRedirURL) {
          if (!this._response) {
            this._response = this.injector.get(RESPONSE);
          }
          this._response.redirect(this.env.domain + params.cfRedirURL, 301);
        }
      });
    }
  }

  public set404StatusCode(): void {
    if (!this.domSrv.isPlatformBrowser()) {
      if (!this._response) {
        this._response = this.injector.get(RESPONSE);
      }
      this._response.status(404);
    }
  }

  /**
   * Function o subscreibe language change to re-set seo data
   */
  private initLangHadnler(): void {
    this.langSrv.getCurrent().subscribe(() => this.setSeo());
  }

  /**
   * Function to susbcribe to user changes
   */
  private initUserHandler(): void {
    this.userSub = this.userService.getCurrent().subscribe(user => (this.user = user));
  }

  /**
   * Read if url use hash # and try to scroll to this hash
   */
  private interceptorHash(): void {
    // Get query paramns
    this.route.queryParamMap.subscribe((params: any) => {
      if (params && params.params && Object.keys(params.params).length > 0) {
        // Check if frgament exists
        if (params.params.fragment) {
          try {
            // Scroll to element in fragment
            setTimeout(() => {
              this.domSrv.scrollTo('#' + params.params.fragment);
            }, 1000);
          } catch (e) {
            console.log(e);
          }
        }
      }
    });
  }

  /**
   * Activates inner loader if route changes
   */
  public interceptorUrl(): void {
    this.route.url.subscribe(() => {
      const component: any = this.route.component;

      if (component.name !== this._lastComponentNavegate) {
        this._lastComponentNavegate = component.name;
        this.setInnerLoader(true, true);
      }
    });

    this.route.queryParams.subscribe(params => {
      // Check expression this way since 'app' returns string
      if (params.app === 'true') {
        this.app = true;
      }
    });
  }

  /**
   * Show or hide spinner
   */
  public setLoading(set: boolean): void {
    this.loaderSrv.setLoading(set);
  }

  /**
   * Show or hide internal loader
   */
  public setInnerLoader(set: boolean, page: boolean): void {
    this.eventSrv.dispatchEvent('loading-animation', {set, isPage: page});
  }

  /**
   * Set seo data and JSON meta
   */
  public setSeo(params?: any, json?: any): void {
    this.seoSrv.set(this.getPath(), params || null);

    this.seoSrv.addJson('company', {
      '@context': 'https://schema.org/',
      '@type': 'Organization',
      name: 'Crowdfarming',
      url: 'https://www.crowdfarming.com',
      logo: 'https://www.crowdfarming.com/assets/img/logo_v2.png'
    });

    if (json) {
      this.seoSrv.addJson('product', json);
    } else {
      this.seoSrv.removeJson('product');
    }
  }

  /**
   * Get url param value
   */
  public getParam(param: string): string {
    return this.route.snapshot.paramMap.get(param);
  }

  /**
   * Get url path value
   */
  public getPath(): string {
    return this.router.url;
  }

  /**
   * Get user info
   */
  public async loadUser(force: boolean = false): Promise<any> {
    // Get user only if it's a private page
    if (this.getPath().includes('private-zone') || this.getPath().includes('order')) {
      this.user = await this.userService.get(force);
    }
  }

  /**
   * Load Countries
   */
  public async loadCountries(): Promise<void> {
    this.countries = await this.countrySrv.getAll();
    for (const country of this.countries) {
      this.countriesByIso[country.iso] = country;
    }
  }

  /**
   * Loads Country obj
   */
  public async loadCountriesByISO(): Promise<void> {
    this.countriesByIso = await this.countrySrv.getCountriesByISO();
  }

  /**
   * Current lang
   */
  public getLang(): string {
    return this.langSrv.getCurrentLang();
  }

  public openPrivateMobileMenu(): void {
    this.popoverSrv.close();
    this.popoverSrv.open('PrivateMobileMenuComponent', 'header-notification-container', {
      inputs: {},
      outputs: {
        onClose: () => {
          this.popoverSrv.close('PrivateMobileMenuComponent');
        }
      }
    });
  }

  /**
   * Triggers function only if
   */
  public async checkLogin(cb: any, errorCb?: any): Promise<void> {
    if (this.userService.isAutoLogged()) {
      const socialAcc = await this.userService.getIsSocial(this.userService.getCurrentUser()?._id);
      const loginPopup = this.popupSrv.open(LoginPopupComponent, {
        data: {
          email: this.user.email,
          socialAcc,
          autoLoginMsg: this.textSrv.getText('You need to login to continue'),
          loginCallback: async err => {
            if (!err) {
              this.userService.toggleAutoLogin(false);
              await cb();
            } else {
              if (errorCb) {
                await errorCb();
              }
            }
          }
        }
      });

      loginPopup.onClose.subscribe(result => {
        if (result === 'recoverAccess') {
          const popup = this.popupSrv.open(ForgotPasswordPopupComponent);

          popup.onClose.subscribe(e => {
            if (e) {
              this.popupSrv.open(GenericPopupComponent, {
                data: {
                  msg: this.textSrv.getText('We have send you an email for remember your pass'),
                  id: 'forgot-password'
                }
              });
            }
          });
        }
      });
    } else {
      cb();
    }
  }

  public showErrorPopup(): void {
    this.popupSrv.open(StatusPopupComponent, {
      data: {
        err: true,
      },
    });
  }
}
