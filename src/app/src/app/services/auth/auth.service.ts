import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { SocialRegisterInterface } from '@app/interfaces';
import { BaseService } from '../base';
import { StorageService } from '../storage';
import { RouterService } from '../router';
import { AuthResource } from '../../resources';
import { LangService } from '../lang';
import { CartsService } from '../carts';
import { FacebookService } from '../facebook';
import { IpapiService } from '../ipapi';
import { TrackingConstants, TrackingService } from '../tracking';
import { environment } from '../../../environments/environment';
import { ConfigService, LoggerService, DomService, GoogleService } from '..';
import { REMOTE_CONFIG } from '@app/constants/remote-config.constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {
  private LOGIN_DURATION: number;
  private AUTO_LOGIN_KEY: string;
  private LOGIN_KEY: string;

  constructor(
    private storageSrv: StorageService,
    private routerSrv: RouterService,
    private authRsc: AuthResource,
    private langSrv: LangService,
    public injector: Injector,
    private cartSrv: CartsService,
    private domSrv: DomService,
    private facebookSrv: FacebookService,
    private googleSrv: GoogleService,
    private trackingSrv: TrackingService,
    private ipapiSrv: IpapiService,
    private configSrv: ConfigService,
    private logger: LoggerService
  ) {
    super(injector);
    this.LOGIN_DURATION = environment.session?.hoursDuration * 60 * 60 || null;
    this.AUTO_LOGIN_KEY = 'auto-login';
    this.LOGIN_KEY = environment.session?.key || null;
  }

  private activeLogRocket(user): void {
    try {
      this.configSrv.getValue(REMOTE_CONFIG.LOG_ROCKET).subscribe(async (logRocket) => {
        logRocket = logRocket ? JSON.parse(logRocket._value) : null;

        const isLogRocketActive = !!(logRocket?.active && logRocket.routes?.length);

        if (isLogRocketActive) {
          const LogRocket = await this.trackingSrv.loadLogRocket(logRocket);

          LogRocket.identify(user._id, {
            name: user.name + ' ' + user.surnames,
            email: user.email,
          });
        }
      });
    } catch (e) {
      this.logger.error('Error activando logRocket', e);
    }
  }

  public isAutoLogged(): boolean {
    return !!this.storageSrv.get(this.AUTO_LOGIN_KEY);
  }

  public b64Decode(s: string): string {
    try {
      return atob(s);
    } catch (e) {
      let b = 0;
      let l = 0;
      let r = '';
      const m = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

      s.split('').forEach((v) => {
        // eslint-disable-next-line no-bitwise
        b = (b << 6) + m.indexOf(v);
        l += 6;
        if (l >= 8) {
          // eslint-disable-next-line no-bitwise
          r += String.fromCharCode((b >>> (l -= 8)) & 0xff);
        }
      });

      return r;
    }
  }

  private getUserFromToken(token: string): any {
    const parts = token.split('.');
    const data = JSON.parse(this.b64Decode(parts[1]));

    if (data?.user?._profile !== undefined) {
      return data.user;
    } else {
      throw new Error('AUTH:TOKEN_INVALID');
    }
  }

  private getCurrentData(): any {
    if (this.domSrv.isPlatformBrowser()) {
      return this.storageSrv.getCurrentLoginData();
    }

    return null;
  }

  public getCurrentToken(): string {
    return this.getCurrentData()?.token || '';
  }

  public getCurrentUser(): any {
    if (this.domSrv.isPlatformBrowser() && this.isLogged()) {
      return this.storageSrv.getCurrentUser();
    } else {
      return null;
    }
  }

  public setUserOnStorage(user: any): void {
    const token = this.getCurrentToken();

    this.refreshAuthInfo(user, token);
  }

  public refreshAuthInfo(user: any, token: string): void {
    try {
      if (this.isLogged()) {
        const tokenUser = this.getUserFromToken(token);
        const currentData = this.getCurrentData();
        const isSameUserToken = currentData.user._id === tokenUser?._profile;
        const isSameUserLogged = currentData.user._id === user?._id;

        if (isSameUserLogged && isSameUserToken) {
          this.setLoginData(user, token);
        } else {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          this.logger.error(`Error refresh: cross session. TokenUser: ${tokenUser?._profile} -- CurrentUser: ${currentData?.user?._id}`);
        }
      }
    } catch (e) {
      this.logger.error('AUTH:REFRESH_TOKEN', e);
    }
  }

  public startTracking(user: any, type: number): void {
    this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.LOGIN, false, {
      userID: user._user,
      userType: TrackingConstants.GTM.PARAMS.CROWDFARMER,
      loginType:
        type === 3
          ? TrackingConstants.GTM.PARAMS.GOOGLE
          : type === 2
          ? TrackingConstants.GTM.PARAMS.FB
          : TrackingConstants.GTM.PARAMS.MANUAL,
    });
  }

  public async login(type: number, body?: any): Promise<any> {
    let data: any;

    switch (type) {
      case 1:
        data = await this.authRsc.login(body);
        break;
      case 2:
        data = await this.facebookSrv.login();
        break;
    }

    if (data?.token) {
      const { token } = data;
      const user = await this.finishLogin(token, false);

      this.startTracking(user, type);

      // await this.userSrv.setDevice(user._user);
      // TODO desacoplar login de devices, tracking y logrocket. No lo hacemos porq vamos a refactorizar devices
      // Lo dejamos así por las prisas de sacar esto para el problema de cruce de sesiones
      return data;
    } else {
      throw new Error('AUTH:LOGIN_FAILED');
    }
  }

  async loginWithGoogle(gToken: string): Promise<any> {
    try {
      const res = await this.googleSrv.getGoogleUser(gToken);

      const socialData: SocialRegisterInterface = {
        id: res.sub,
        token: gToken,
        name: res.given_name,
        email: res.email,
        surnames: res.family_name,
        ...(res.gender && { gender: res.gender }),
        ...(res.birthday && { birthday: res.birthday }),
      };

      const data = await this.authRsc.social({ socialData, socialType: 'g' });
      const cfUser = await this.finishLogin(data?.token, false);

      this.startTracking(cfUser, 3);
    } catch (err) {
      throw new Error('You need to login and give permission to register');
    }
  }

  public async finishLogin(token: string, autoLogin: boolean): Promise<any> {
    const user = await this.getMe(token);

    this.setLoginData(user, token);
    this.activeLogRocket(user);
    this.toggleAutoLogin(autoLogin);

    return user;
  }

  public getMe(token?: string): Promise<any> {
    return this.authRsc.getMe(token);
  }

  /**
   * Borra datos sesión
   */
  public clearLoginStorage(): void {
    this.storageSrv.clear(this.LOGIN_KEY);
    this.storageSrv.clear('auto-login');
    this.storageSrv.clear('lastPayment');
  }

  /**
   * Set de la info de sesión
   *
   * @param user
   * @param token
   * @private
   */
  private setLoginData(user: any, token: string): void {
    if (this.domSrv.isPlatformBrowser() && user && token) {
      this.storageSrv.set(this.LOGIN_KEY, { token, user }, this.LOGIN_DURATION);
    } else {
      throw new Error('AUTH:BAD_REQUEST');
    }
  }

  /**
   * Toggle de autologin
   *
   * @param status
   */
  public toggleAutoLogin(status: boolean): void {
    if (status) {
      this.storageSrv.set(this.AUTO_LOGIN_KEY, true);
    } else {
      this.storageSrv.clear(this.AUTO_LOGIN_KEY);
    }
  }

  /**
   * Recover password function
   */
  public async recover(body: any): Promise<any> {
    return await this.authRsc.recover(body);
  }

  /**
   * Autologin service
   * Sólo hace login si NO estamos logados
   */
  public async autoLogin(hash: any, isMkt: boolean): Promise<any> {
    const fn = isMkt ? 'autoLoginMktCloud' : 'autoLogin';
    const data = await this.authRsc[fn](hash);

    if (data?.token) {
      if (this.isLogged() === true) {
        // We don't overwrite existing user
        data.user = this.getCurrentUser();
      } else {
        data.user = await this.finishLogin(data.token, true);
      }
      if (data.extra?.cart?.length) {
        for (const product of data.extra.cart) {
          if (product.up) {
            product._up = product.up;
          }
          if (product.masterBox) {
            product._masterBox = product.masterBox;
          }
          if (product.upCf) {
            product._upCf = product.upCf;
          }
          if (product.uberUpData && product.uberUpData._id) {
            product._uberUp = product.uberUpData._id;
            product.uberUp = product.uberUpData;
          }
        }
        this.cartSrv.update(data.extra.cart, 'Step summary');
      }
    }

    return data;
  }

  /**
   * Register function
   */
  public async register(body: any): Promise<any> {
    // Fill notification language
    body.notificationLanguage = this.langSrv.getCurrentLang();
    // Get location with IPAPI
    try {
      const country = await this.ipapiSrv.get();

      if (country?.length === 2) {
        body.registrationInfo.ipCountry = country;
      }
    } catch (e) {
      console.error(e);
    }

    const data = await this.authRsc.register(body);

    if (data) {
      this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.REGISTER, false, {
        userID: data._user,
        userType: TrackingConstants.GTM.PARAMS.CROWDFARMER,
        loginType: TrackingConstants.GTM.PARAMS.MANUAL,
      });
    }

    return data;
  }

  /**
   * Soft register function
   */
  public async soft(body: any): Promise<any> {
    // Fill notification language
    body.notificationLanguage = this.langSrv.getCurrentLang();
    // Get location with IPAPI
    try {
      const country = await this.ipapiSrv.get();

      if (country?.length === 2) {
        body.registrationInfo.ipCountry = country;
      }
    } catch (e) {
      console.error(e);
    }

    this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.NEWSLETTER);

    return await this.authRsc.soft(body);
  }

  /**
   * Logout function
   */
  public logout(keepCart = false, redirectToHome = true): void {
    // Clear storage
    this.clearLoginStorage();
    this.logger.createSessionId(true);

    // Clear google token
    this.googleSrv.resetToken();

    // Clear cart
    if (!keepCart) {
      this.cartSrv.clear();
    } else {
      // Keeps cart items but removes thoses related with an upCf
      let cartItems = this.cartSrv.get();

      if (cartItems) {
        for (let i = 0; i < cartItems.length; i++) {
          if (cartItems[i]._upCf) {
            this.cartSrv.remove(i);
            cartItems = this.cartSrv.get();
            i--;
          }
        }
      }
    }

    this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.LOGOUT);

    // Redirect to home
    redirectToHome && this.routerSrv.navigate('home');
  }

  /**
   * Retrieve if session/user is logged
   */
  public isLogged(): boolean {
    return this.domSrv.isPlatformBrowser() && this.storageSrv.isLogged();
  }

  /**
   * Auth guard for routes
   */
  public canActivate(route: ActivatedRouteSnapshot): boolean {
    const isLogged = this.isLogged();
    const isLoginPath = route.url[0].path === 'login-register';

    if (isLogged) {
      // If login page redirect to home
      if (isLoginPath) {
        this.routerSrv.navigate('home');

        return false;
      }

      // If not allow navigating
      return true;
    } else if (isLoginPath) {
      // If not logged and navigate to log in allow it
      return null;
    } else {
      this.routerSrv.navigate('login-register');

      return false;
    }
  }

  /**
   * Change password function
   */
  public checkToken(token: string): Promise<boolean> {
    return this.authRsc.checkToken(token);
  }

  /**
   * Change password function
   */
  public changePassword(passwordData: any): Promise<any> {
    return this.authRsc.changePassword(passwordData);
  }

  /**
   * Change password function AutoLogin
   */
  public async changePasswordAutoLogin(passwordData: any): Promise<any> {
    const data = await this.authRsc.changePasswordAutoLogin(passwordData);

    if (data) {
      this.toggleAutoLogin(false);
    }

    return data;
  }

  /**
   * Get user
   */
  public getBan(): Promise<any> {
    return this.authRsc.getBan();
  }
}
