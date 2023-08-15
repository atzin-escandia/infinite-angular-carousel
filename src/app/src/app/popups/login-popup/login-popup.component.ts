import {Component, OnInit, Output, EventEmitter, AfterContentChecked, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {PopupsInterface} from '../popups.interface';
import {PopupsRef} from '../popups.ref';
import {
  AuthService,
  TextService,
  RouterService,
  FacebookService,
  GoogleService,
  ConfigService,
  StateService,
  LoggerService
} from '../../services';
import {ISocialAvailability, SocialKey} from '@app/interfaces';
import {catchError, filter, first, map, mergeMap, timeout} from 'rxjs/operators';
import {Subscription, throwError} from 'rxjs';
import {REMOTE_CONFIG} from '@app/constants/remote-config.constants';

@Component({
  selector: 'login-popup',
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.scss']
})
export class LoginPopupComponent implements OnInit, AfterContentChecked, OnDestroy {
  @Output() public returnUserData = new EventEmitter<any>();

  private gTokenSubscription = new Subscription();

  public onClose: any;
  public user: { email: string; password: string } = { email: '', password: '' };
  public blockEmail = false;
  public loaded = false;
  public autoLoginMsg: string;
  public errorMsg: string;
  public socialAvailability: ISocialAvailability;

  constructor(
    public config: PopupsInterface,
    public popup: PopupsRef,
    private authSrv: AuthService,
    public textSrv: TextService,
    public routerSrv: RouterService,
    private facebookSrv: FacebookService,
    private googleSrv: GoogleService,
    private cdr: ChangeDetectorRef,
    private configSrv: ConfigService,
    private stateSrv: StateService,
    private loggerSrv: LoggerService,
  ) { }

  ngOnInit(): void {
    this._initGoogleLoginSubscription();

    if (this.config.data.email) {
      this.user.email = this.config.data.email;
      this.blockEmail = true;
    }

    if (this.config.data.autoLoginMsg) {
      this.autoLoginMsg = this.config.data.autoLoginMsg;
    }

    this.stateSrv.social ? this._setSocialAvailability() : this._loadSocialConfig();

    this.loaded = true;
  }

  // Need to prevent error
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.gTokenSubscription.unsubscribe();
  }

  async login(type?: number): Promise<void> {
    if (type === 1 && (this.user.email.length < 4 || this.user.password.length < 6)) {
      return;
    }

    try {
      await this.authSrv.login(type, this.user);

      this.onClose(null, async () => {
        await this.config.data.loginCallback();
      });
    } catch (err) {
      this.errorMsg = this.textSrv.getText(err.msg);
    }
  }

  changeUser(): void {
    this.authSrv.logout(true);
    this.routerSrv.navigate('login-register/login', null, {rc: true});
    this.onClose();
  }

  async buttonSelectHandler(key: SocialKey): Promise<void> {
    if (key === 'fb') {
      await this.login(2);
    }
  }

  private _initGoogleLoginSubscription(): void {
    this.gTokenSubscription = this.googleSrv.$gToken.pipe(
      filter((res) => !!res && this.googleSrv.isScriptLoaded)
    ).subscribe(async (gToken) => {
      try {
        await this.authSrv.loginWithGoogle(gToken);
        this.onClose();
      } catch (error) {
        this.loggerSrv.error('Google Login Error', error);
      }
    });
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
  }
}
