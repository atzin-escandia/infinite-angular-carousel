import { Component, OnInit, Injector, OnDestroy, AfterViewInit } from '@angular/core';
import {BasePage} from '../base/';
import { AuthService, FacebookService, GoogleService, StateService, TrackingConstants, TrackingService } from '@app/services';
import {GenericPopupComponent} from '@popups/generic-popup';
import {ISocialAvailability, Registration} from '@app/interfaces';
import {ConfigService, GiftService} from '@app/services';
import {Events} from '@enums/events.interface';
import {Subscription, throwError} from 'rxjs';
import {PURCHASE_LS} from '@app/modules/purchase/constants/local-storage.constants';
import {catchError, filter, first, map, mergeMap, timeout} from 'rxjs/operators';
import {F2bService} from '@services/f2b';
import {REMOTE_CONFIG} from '@app/constants/remote-config.constants';

@Component({
  selector: 'login-register',
  templateUrl: './login-register.page.html',
  styleUrls: ['./login-register.page.scss'],
})
export class LoginRegisterPageComponent extends BasePage implements OnInit, OnDestroy, AfterViewInit {
  public user: any;
  public redirectConfirm = false;
  public redirectConfirmReset = false;
  public uri = '';
  public tabsTexts: any = [this.textSrv.getText('Register'), this.textSrv.getText('Login')];
  public tabsIds: any = ['register-tab', 'login-tab'];
  public tab: number; // REgister === 0 | Login === 1
  public socialAvailability: ISocialAvailability;
  public companyLogo?: string;

  private loadingGiftSubscription: Subscription;
  private groupOrderNumber?: string;
  private isGroupOrder?: boolean;
  private isCrowdgiving?: boolean;
  private gift: { hash?: string } = {};
  private gTokenSubscription = new Subscription();

  constructor(
    public injector: Injector,
    private authSrv: AuthService,
    private facebookSrv: FacebookService,
    private googleSrv: GoogleService,
    private configSrv: ConfigService,
    private f2bSrv: F2bService,
    private giftSrv: GiftService,
    private stateSrv: StateService,
    private trackingSrv: TrackingService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this._initGoogleLoginSubscription();

    this.route.queryParams.subscribe(async (query) => {
      const giftHash = query.gift;

      this.redirectConfirm = query.rc;
      this.uri = query.uri;
      this.groupOrderNumber = query.go;
      this.isGroupOrder = query.isgo === 'true';

      if (query.company) {
        this.f2bSrv.setLeadInfo(query.company, query.refCode);
        await this.showCompanyLogo(query.company);
      }

      if (query.ar) {
        this.user.email = query.e;
        this.user.name = query.n;
      }

      if (giftHash) {
        this.loadingGiftSubscription = this.giftSrv.isLoading$.subscribe(value => {
          this.setLoading(value);
          this.setInnerLoader(value, value);
        });

        this.gift.hash = giftHash;
        await this.giftSrv.verifyGiftHash(giftHash);
      }
    });

    if (this.authSrv.isLogged() && !this.gift.hash) {
      this.routerSrv.navigate('private-zone');

      return;
    }

    this.stateSrv.social ? this._setSocialAvailability() : this._loadSocialConfig();

    this.user = {
      email: '',
      password: '',
      repassword: '',
      name: '',
      surnames: '',
    };

    // subscribe to observable to toggle forms according to header order
    this.route.params.subscribe(params => {
      this.tab = params.action === 'login' ? 1 : 0;
    });

    this.route.queryParams.subscribe(query => {
      this.redirectConfirm = query.rc;
      this.redirectConfirmReset = query.rcr;
      this.uri = query.uri;
      this.groupOrderNumber = query.go;
      this.isGroupOrder = query.isgo === 'true';
      this.isCrowdgiving = query.cg === 'true';

      if (query.company) {
        void this.showCompanyLogo(query.company);
      }

      if (query.ar) {
        this.user.email = query.e;
        this.user.name = query.n;
      }
    });

    if (!this.gift.hash) {
      this.setLoading(false);
      this.setInnerLoader(false, false);
    }
  }

  ngOnDestroy(): void {
    this.loadingGiftSubscription?.unsubscribe();
    this.gTokenSubscription?.unsubscribe();
    this.domSrv.showHeader();
    this.domSrv.showFooter();
  }

  async showCompanyLogo(slug: string): Promise<void> {
    const company = await this.f2bSrv.getCompanyBySlug(slug);

    if (company) {
      this.companyLogo = company.logo;
    }
  }

  /**
   * Trigger on click login
   */
  public async login(type: number, email?: string, password?: string): Promise<void> {
    const body = {
      email: (email ? email.toLowerCase() : '') || '',
      password: password || '',
    };

    try {
      const login = await this.authSrv.login(type, body);

      login && await this._afterLogin();
    } catch (error) {
      this._catchLoginError(error);
    }
  }

  private _initGoogleLoginSubscription(): void {
    this.gTokenSubscription = this.googleSrv.$gToken.pipe(
      filter((res) => !!res && this.googleSrv.isScriptLoaded)
    ).subscribe(async (gToken) => {
      try {
        await this.authSrv.loginWithGoogle(gToken);
        await this._afterLogin();
      } catch (error) {
        this._catchLoginError(error, 'google');
      }
    });
  }

  private async _afterLogin(): Promise<void> {
    const isOwnGifter = await this.giftSrv.isUserAGifter();

    this.f2bSrv.clearLead();

    await this.userService.get(true);

    if (this.redirectConfirm) {
      if (this.isCrowdgiving) {
        this.routerSrv.navigate('crowdgiving', null, { section: 'payment' });
      } else if (this.isGroupOrder) {
        localStorage.setItem(PURCHASE_LS.IS_GROUP_ORDER, 'true');

        this.groupOrderNumber
          ? this.routerSrv.navigate('order/checkout', null, { section: 'payment', go: this.groupOrderNumber })
          : this.routerSrv.navigate('order/checkout', null, { section: 'shipment', isgo: true });
      } else {
        this.routerSrv.navigate('order/checkout', null, {
          section: this.redirectConfirmReset || isOwnGifter ? 'cart' : 'shipment',
        });
      }
    } else if (this.uri) {
      if (this.uri.includes('refCode')) {
        this.routerSrv.navigate('home');
      } else {
        this.routerSrv.navigate(this.uri);
      }
    } else if (this.gift.hash) {
      await this.giftSrv.handleActivation(this.gift.hash, () => {
        this.routerSrv.navigateByEvent(Events.NOT_AVAILABLE_GIFT);
      });
    } else {
      if (window) {
        if (window?.location?.search.includes('refCode')) {
          this.routerSrv.navigate('home');
        } else if (window.history && window.history.length > 2) {
          this.routerSrv.goBack();
        } else {
          this.routerSrv.navigate('home');
        }
      } else {
        this.routerSrv.navigate('home');
      }
    }
  }

  private _catchLoginError(error: any, social?: 'google'): void {
    this.popupSrv.open(GenericPopupComponent, {
      data: {
        msg: this.textSrv.getText(social === 'google' ? 'Google Login Error' : error.msg || error),
        id: 'login-error'
      }
    });

    if (social === 'google') {
      this.loggerSrv.error('Google Login Error', error);
    }
  }

  /**
   * Trigger function on register new user
   */
  public async register(data: any): Promise<void> {
    if (data.type !== 1) {
      void this.login(data.type);
    } else {
      const f2b = this.f2bSrv.getLeadInfo();
      const body: Registration = {
        email: data.email.toLowerCase(),
        name: data.name,
        password: data.password,
        registrationInfo: {
          url: this.utilsSrv.getFullUrl(),
        },
        surnames: data.surnames || '',
        over18: this.storageSrv.get('over18') || false,
      };

      if (this.groupOrderNumber) {
        body.registrationInfo.reason = {
          type: 'GROUP_ORDER_INVITATION',
          id: this.groupOrderNumber,
        };
      } else if (this.gift.hash) {
        body.registrationInfo.reason = {
          type: 'GIFT_INVITATION',
          id: this.gift.hash,
        };
      }

      if (f2b.companySlug) {
        body.companySlug = f2b.companySlug;
        if (f2b.refCode) {
          body.refCode = f2b.refCode;
        }
      }

      try {

        const register = await this.authSrv.register(body);

        if (register) {
          // Autologin user
          await this.login(1, data.email, data.password);
        }
      } catch (error) {
        // Handle register errors
        this.popupSrv.open(GenericPopupComponent, { data: { msg: error.msg, id: 'register-error' } });
      }
    }
  }

  private _loadSocialConfig(): void {
    this.configSrv.isRemoteConfigLoaded$
      .pipe(
        first((res) => !!res),
        timeout(10000),
        mergeMap(() => this.configSrv.getBoolean(REMOTE_CONFIG.FB_LOGIN)),
        mergeMap((fbLogin: boolean) =>
          this.configSrv.getBoolean(REMOTE_CONFIG.GOOGLE_LOGIN).pipe(map((googleLogin) => ({ fbLogin, googleLogin })))
        ),
        first(({ fbLogin, googleLogin }) => typeof fbLogin === 'boolean' && typeof googleLogin === 'boolean'),
        catchError(() => throwError(new Error('Error loading social config')))
      )
      .subscribe(({ fbLogin, googleLogin }) => {
        this.stateSrv.setSocial({ fb: fbLogin, gg: googleLogin });
        this._setSocialAvailability();
        fbLogin && this.facebookSrv.init();
        googleLogin && this.googleSrv.init();
      });
  }

  private _setSocialAvailability(): void {
    this.socialAvailability = this.stateSrv.social;
    if (this.f2bSrv.isFromF2B()) {
      this.socialAvailability.gg = false;
      this.socialAvailability.fb = false;
    }
  }

  ngAfterViewInit(): void {
    const customEventData = {
      cf_page_title: TrackingConstants.GTM4.CF_PAGE_TITLE.LOGIN_REGISTER,
      page_type: TrackingConstants.GTM4.PAGE_TYPE.LOGIN_REGISTER,
      language: this.langSrv.getCurrentLang(),
      country_delivery: this.countrySrv.getCurrentCountry()?.iso
    };

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PAGE_VIEW, false, customEventData);
  }
}
