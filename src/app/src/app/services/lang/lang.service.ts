import { Inject, Injectable, Injector } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { StorageService } from '../storage';
import { DOCUMENT } from '@angular/common';
import { TranslocoService } from '@ngneat/transloco';
import { ILanguage } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class LangService implements CanActivate {
  constructor(
    private router: Router,
    public injector: Injector,
    private storageSrv: StorageService,
    private translocoSrv: TranslocoService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  private DEFAULTlangSrv = 'en';
  private currentLang: string = null;
  private current = new Subject<string>();

  private readonly currentLangIsoSubject$ = new BehaviorSubject<string>(this.DEFAULTlangSrv);
  readonly currentLangIso$ = this.currentLangIsoSubject$.asObservable();

  // Allowed languages
  private langsData: any = {
    es: {
      uri: '/es',
    },
    en: {
      uri: '/en',
    },
    de: {
      uri: '/de',
    },
    fr: {
      uri: '/fr',
    },
    nl: {
      uri: '/nl',
    },
    it: {
      uri: '/it',
    },
    sv: {
      uri: '/sv',
    },
  };

  /**
   * Get all languages
   */
  public private(): any {
    return this.langsData;
  }

  /**
   * Default lang code
   */
  public getDefaultLang(): string {
    return this.DEFAULTlangSrv;
  }

  /**
   * Get current language
   */
  public getCurrentLang(): string {
    return this.currentLang || this.DEFAULTlangSrv;
  }

  /**
   * Return counter language on Observable
   */
  public getCurrent(): Observable<string> {
    return this.current.asObservable();
  }

  /**
   * Set language
   */
  public setCurrentLang(lang: string): boolean {
    if (this.langsData[lang]) {
      this.currentLang = lang;
      // Set current data as observable
      this.current.next(lang);
      this.currentLangIsoSubject$.next(lang);
      this.document.documentElement.lang = lang;

      if (lang) {
        const country = this.storageSrv.get('location') || null;
        let fullLang = lang;

        if (country === 'us' && lang === 'en') {
          fullLang = lang + '_' + country.toUpperCase();
        }

        this.translocoSrv.setActiveLang(fullLang);
      }

      return true;
    }

    return false;
  }

  /**
   * Get lang from browser if not return default one
   */
  public getLangBrowser(): string {
    if (typeof navigator === 'object') {
      for (const lang of navigator.languages) {
        const currentLang = lang.substring(0, 2).toLowerCase();

        if (this.setCurrentLang(currentLang)) {
          return currentLang;
        }
      }
    }

    return this.DEFAULTlangSrv;
  }

  /**
   * Get lang from user
   */
  public getUserLang(): string {
    return this.storageSrv.getCurrentUser()?.notificationLanguage || null;
  }

  /**
   * Get lang from last session
   */
  public getLastLang(): string {
    let lastLang = null;

    if (this.storageSrv.get('lastLanguage')) {
      lastLang = this.storageSrv.get('lastLanguage').toLowerCase();
    }

    return lastLang;
  }

  /**
   * Get menu languages availables
   */
  public getMenuLangs(): ILanguage[] {
    return [
      { longName: 'English', shortName: 'EN' },
      { longName: 'Deutsch', shortName: 'DE' },
      { longName: 'Español', shortName: 'ES' },
      { longName: 'Français', shortName: 'FR' },
      { longName: 'Nederlands', shortName: 'NL' },
      { longName: 'Italiano', shortName: 'IT' },
      { longName: 'Svenska', shortName: 'SV' },
    ];
  }

  // TODO change to public service from CAPI
  /**
   * Gets every language name in chosen language
   */
  public getAvailableLangs(e: string): { code: string; name: string }[] {
    const langs = {
      es: [
        { code: 'es', name: 'Español' },
        { code: 'de', name: 'Alemán' },
        { code: 'en', name: 'Inglés' },
        { code: 'fr', name: 'Francés' },
        { code: 'nl', name: 'Holandes' },
        { code: 'it', name: 'Italiano' },
        { code: 'sv', name: 'Sueco' },
      ],
      de: [
        { code: 'es', name: 'Spanish' },
        { code: 'de', name: 'Deutsch' },
        { code: 'en', name: 'Englisch' },
        { code: 'fr', name: 'Französisch' },
        { code: 'nl', name: 'Dutch' },
        { code: 'it', name: 'Italian' },
        { code: 'sv', name: 'Swedish' },
      ],
      en: [
        { code: 'es', name: 'Spanish' },
        { code: 'de', name: 'German' },
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'French' },
        { code: 'nl', name: 'Dutch' },
        { code: 'it', name: 'Italian' },
        { code: 'sv', name: 'Swedish' },
      ],
      fr: [
        { code: 'es', name: 'Espagnol' },
        { code: 'de', name: 'Allemand' },
        { code: 'en', name: 'Anglais' },
        { code: 'fr', name: 'Français' },
        { code: 'nl', name: 'Dutch' },
        { code: 'it', name: 'Italian' },
        { code: 'sv', name: 'Swedish' },
      ],
      nl: [
        { code: 'es', name: 'Spanish' },
        { code: 'de', name: 'German' },
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'French' },
        { code: 'nl', name: 'Dutch' },
        { code: 'it', name: 'Italian' },
        { code: 'sv', name: 'Swedish' },
      ],
      it: [
        { code: 'es', name: 'Spanish' },
        { code: 'de', name: 'German' },
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'French' },
        { code: 'nl', name: 'Dutch' },
        { code: 'it', name: 'Italian' },
        { code: 'sv', name: 'Swedish' },
      ],
      sv: [
        { code: 'es', name: 'Spanish' },
        { code: 'de', name: 'German' },
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'French' },
        { code: 'nl', name: 'Dutch' },
        { code: 'it', name: 'Italian' },
        { code: 'sv', name: 'Swedish' },
      ],
    };

    return langs[e];
  }

  /**
   * Guard function
   */
  public canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
    let lang: string = null;
    let path = '';

    if (route.url.length >= 1) {
      path = route.url[0].path;
    }

    if (!Object.keys(this.langsData).includes(path)) {
      // If path does not include a language ex:"/en"
      if (this.getUserLang()) {
        // If user is logged and has a prefered language defined
        const newRoute = '/' + this.getUserLang() + '/' + route.url.join('/');

        void this.router.navigate([newRoute]);
      } else {
        // If user is not logged or has not defined a prefered language
        if (this.getLastLang()) {
          // If there is a last language saved from previous sessions
          const newRoute = '/' + this.getLastLang() + '/' + route.url.join('/');

          void this.router.navigate([newRoute]);
        } else {
          // If there is not a last language saved from previous sessions
          if (this.getLangBrowser()) {
            // If we can get language info from browser
            const newRoute = '/' + this.getLangBrowser() + '/' + route.url.join('/');

            void this.router.navigate([newRoute]);
          } else {
            // If we cannot get language info from browser
            const newRoute = '/' + this.getCurrentLang() + '/' + route.url.join('/');

            void this.router.navigate([newRoute]);
          }
        }
      }
    } else {
      // If path includes a language ex:"/en"
      if (!this.setCurrentLang(path)) {
        lang = this.getLangBrowser();
      } else if (this.currentLang === null) {
        lang = this.getLangBrowser();
      }

      if (lang !== null) {
        void this.router.navigate(['/' + lang]);
      }
    }

    return true;
  }
}
