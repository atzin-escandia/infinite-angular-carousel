import { Injectable, Injector } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BaseService } from '../base';
import { LangService } from '../lang';

import { environment } from '../../../environments/environment';

import * as _dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import * as IDsTranslation from '../../../app/transloco/ids-lokalise-old-trans.json';
const idsTranslation: any = IDsTranslation;

const dayjs = _dayjs;

dayjs.extend(utc);

declare let window: any;

@Injectable({
  providedIn: 'root',
})
export class TextService extends BaseService implements CanActivate {
  private loadedText = 'noLoaded';
  private SimpleMDE: any;
  private translationKey = {};
  private t: any = (t: string) => t;

  constructor(public injector: Injector, private langSrv: LangService) {
    super(injector);

    for (const key of idsTranslation.default) {
      this.translationKey[key.mpboID] = key.lokaliseID;
    }
  }

  /**
   * Guard function
   */
  public async canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<any> {
    // Check if texts are loaded
    if (this.checkTexts()) {
      return true;
    }

    // Load texts
    await this.get();

    return true;
  }

  /**
   * Check if texts are loaded
   */
  private checkTexts(): boolean {
    return this.loadedText === this.langSrv.getCurrentLang();
  }

  /**
   * Fetch texts from server
   */
  public get(forceLang = ''): Promise<any> {
    if (this.loadedText === forceLang) {
      return;
    }

    this.loadedText = forceLang ? forceLang : this.langSrv.getCurrentLang();

    this.langSrv.setCurrentLang(forceLang);
  }

  /**
   * Get text in current language by id
   */
  public getText(id: string, replacements?: any): string {
    let translated: string;
    let lokaliseId = id;

    // Set correct ID for new and old Keys
    if (this.translationKey[id]) {
      lokaliseId = this.translationKey[id];
    }

    translated = this.getTranslate(lokaliseId);

    if (replacements) {
      translated = this.replaceAll(translated, replacements);
    }

    return translated;
  }

  /**
   * Replace all getText for getTranslate correct
   *
   * textSrv.getText\(('[^,')]*')\)
   * textSrv.getTranslate($1)
   */

  /**
   * translate using transloco t
   *
   * @param id key of lokalise
   * @returns string translated
   */
  public getTranslate(id: string): string {
    return this.t(id);
  }

  /**
   * Set var for transloco
   *
   * @param t transloco
   */
  public setT(t: any): void {
    this.t = t;
  }

  /**
   * Build dynamic urls from multilingual objects with replacements
   */
  public buildDynamicUrl(urlObj: any, replacements: any): string {
    return this.replaceAll(urlObj[this.langSrv.getCurrentLang()], replacements);
  }

  /**
   * Markdown
   */
  public markdown(text: string, replacements: any = null): string {
    if (!this.SimpleMDE) {
      this.loadSMDE();
    } else {
      return this.SimpleMDE.prototype.markdown(text);
    }
    if (replacements) {
      text = this.replaceAll(text, replacements);
    }

    return text;
  }

  /**
   * Loads simpleMDE
   */
  private loadSMDE(): void {
    const simpleSrc = environment.simpleMDE?.url || '';

    if (typeof window === 'object') {
      const simpleScript = document.querySelector(`script[src='${simpleSrc}']`);

      if (!simpleScript) {
        const simple = document.createElement('script');

        simple.src = simpleSrc;
        simple.defer = true;

        simple.onload = () => {
          this.SimpleMDE = window.SimpleMDE;
        };

        document.body.appendChild(simple);
      }
    }
  }

  /**
   * escapeRegExp
   */
  private escapeRegExp(str: string): string {
    // eslint-disable-next-line no-useless-escape
    return (str = str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1'));
  }

  /**
   * This is for farmer up
   */
  public replaceAll(str: string, replacements: any): any {
    if (str && replacements) {
      for (const replacement in replacements) {
        if (replacements[replacement] || replacements.hasOwnProperty(replacement)) {
          str = str.replace(new RegExp(this.escapeRegExp(replacement), 'g'), replacements[replacement]);
        }
      }
    }

    return str;
  }
}
