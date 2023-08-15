import {HttpClient} from '@angular/common/http';
import {
  TRANSLOCO_LOADER,
  Translation,
  TranslocoLoader,
  TRANSLOCO_CONFIG,
  translocoConfig,
  TranslocoModule,
  // TranslocoService
} from '@ngneat/transloco';
import {Injectable, NgModule} from '@angular/core';
import {environment} from '../../environments/environment';
import {TransferStateService} from '@services/transfer-state/transfer-state.service';
import {DomService} from '@services/dom/dom.service';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class TranslocoHttpLoader implements TranslocoLoader {
  private _$translation: any = {};
  $translation: any = {};

  constructor(
    private http: HttpClient,
    private transferStateSrv: TransferStateService,
    private domSrv: DomService,
  ) { }

  // Req Lokalise leg files
  getTranslation(lang: string): Observable<Translation> {
    this.loadFile(lang);

    return this.$translation[lang];
  }

  setTranslation(t: Translation, lang: string): void {
    this._$translation[lang].next(t);
  }

  loadFile(lang: string): void {
    this.createLangObservable(lang);

    const stateKey = `getTranslation_${lang}`;
    const translation: Translation = this.transferStateSrv.get(stateKey, null);

    if (translation !== null) {
      this.setTranslation(translation, lang);

      return;
    }

    this.$translation[lang] = this.http.get<Translation>(environment.lokalise.uri + `${lang}.json`);

    if (!this.domSrv.isPlatformBrowser()) {
      this.$translation[lang].subscribe(
        (translationResponse: Translation) => {
          this.transferStateSrv.set(stateKey, translationResponse);
        }
      );
    }
  }

  createLangObservable(lang: string): void {
    if (!this._$translation[lang]) {
      this._$translation[lang] = new BehaviorSubject<Translation>(null);
      this.$translation[lang] = this._$translation[lang].asObservable();
    }
  }

}

@NgModule({
  exports: [TranslocoModule],
  providers: [
    {
      provide: TRANSLOCO_CONFIG,
      useValue: translocoConfig({
        availableLangs: ['en', 'es', 'de', 'fr', 'it', 'sv', 'nl', 'en_US'],
        defaultLang: 'en',
        fallbackLang: 'en',
        failedRetries: 1,
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: environment.production,
      }),
    },
    {provide: TRANSLOCO_LOADER, useClass: TranslocoHttpLoader},
  ],
})
export class TranslocoRootModule { }
