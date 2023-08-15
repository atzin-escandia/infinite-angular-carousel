import {Inject, Injectable, Injector} from '@angular/core';
import {
  fetchAndActivate,
  getAllChanges,
  getBooleanChanges,
  getValueChanges,
  RemoteConfig,
} from '@angular/fire/remote-config';
import {environment} from '../../../environments/environment';
import {DomService} from '../dom';
import {StorageService} from '../storage';
import {BehaviorSubject, fromEvent, Observable} from 'rxjs';
import {DOCUMENT} from '@angular/common';

declare const window: any;

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly _isRemoteConfigLoaded$ = new BehaviorSubject<boolean>(false);
  readonly isRemoteConfigLoaded$ = this._isRemoteConfigLoaded$.asObservable();
  get isRemoteConfigLoaded(): boolean {
    return this._isRemoteConfigLoaded$.getValue();
  }

  public env = environment;
  private cookiesEvent = 'TargetingCookiesAccepted';
  public remote;

  constructor(
    public injector: Injector,
    private domSrv: DomService,
    private storageSrv: StorageService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  public async init(): Promise<void> {
    this.remote = this.injector.get(RemoteConfig);
    this.loadOneTrust();

    if (this.remote === null) {
      throw new Error('Remote not working');
    } else {
      const fetchTimeoutMillis = Number(environment.firebase?.fetchTimeoutMillis || '60000');
      const minimumFetchIntervalMillis = Number(environment.firebase?.minimumFetchIntervalMillis || '300000');
      const remoteSettings = {
        fetchTimeoutMillis,
        minimumFetchIntervalMillis,
      };

      this.remote.settings = remoteSettings;

      try {
        await fetchAndActivate(this.remote);
        this._isRemoteConfigLoaded$.next(true);
      } catch (err) {
        this._isRemoteConfigLoaded$.next(false);
      }
    }
  }

  public getAll(): Observable<any> {
    return getAllChanges(this.remote);
  }

  public getBoolean(key: string): Observable<boolean> {
    return getBooleanChanges(this.remote, key);
  }

  public getValue(key: string): Observable<any> {
    return getValueChanges(this.remote, key);
  }

  private loadOneTrust(): void {
    if (!this.document.getElementById('onetrust-consent-sdk') && this.domSrv.isPlatformBrowser()) {
      this.loadCookieCompilanceAutoblock();
      this.loadCookieCompilanceScript();
      this.loadCookieCompilanceChangeMethod();
    }
  }

  // /**
  //  * Load oneTrust autoblocker
  //  */
  private loadCookieCompilanceAutoblock(): void {
    const scriptData = {
      src: `https://cdn.cookielaw.org/consent/d5a330c4-aeab-4c4e-a109-7ec24bc44706${this.env.env !== 'pro' ? '-test' : ''}/OtAutoBlock.js`,
    };

    this.loadScript(scriptData);
  }

  /**
   * Load one trust and set event listener in case of accepting Targeting cookies C0004
   */
  private loadCookieCompilanceScript(): void {
    const scriptData = {
      src: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
      'data-document-language': 'true',
      'data-domain-script': 'd5a330c4-aeab-4c4e-a109-7ec24bc44706' + (this.env.env !== 'pro' ? '-test' : ''),
      charset: 'UTF-8',
      onload: () => {
        this.targetingCookiesListener();
      },
    };

    this.loadScript(scriptData);
  }

  /**
   * Load a script that contains a method called every time one trust detects action on their banner
   * could be the first click or on consecutive calls when web load previous selection
   * this dispatch an event that sets a cookie and loads hotjar/logrocket/tapi
   */
  private loadCookieCompilanceChangeMethod(): void {
    const scriptData = {
      text: `function OptanonWrapper() {
        OneTrust.InsertHtml('', '', function setPermissionCookies() {
          var event = new CustomEvent('${this.cookiesEvent}');
          window.dispatchEvent(event)
        }, null, 'C0004');
      } `,
    };

    this.loadScript(scriptData);
  }

  /**
   * Load scripts programatically
   */
  public loadScript(scriptData: any): void {
    const script = document.createElement('script');

    script.type = 'text/javascript';

    if (scriptData.src) {
      script.src = scriptData.src;
    }

    if (scriptData.text) {
      script.text = scriptData.text;
    }

    if (scriptData.charset) {
      script.charset = scriptData.charset;
    }

    if (scriptData['data-document-language'] && scriptData['data-domain-script']) {
      script.setAttribute('data-document-language', 'true');
      script.setAttribute('data-domain-script', 'd5a330c4-aeab-4c4e-a109-7ec24bc44706' + (this.env.env !== 'pro' ? '-test' : ''));
    }

    if (scriptData.onload) {
      script.onload = scriptData.onload;
    }

    // append the script tag in the DOM
    this.document.getElementsByTagName('head')[0].appendChild(script);
  }

  public targetingCookiesListener(): void {
    fromEvent(window, this.cookiesEvent).subscribe(() => {
      this.storageSrv.set(this.cookiesEvent, true, 0, null, 2);
    });
  }
}
