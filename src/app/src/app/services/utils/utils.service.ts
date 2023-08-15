import { Injectable, Injector } from '@angular/core';
import { BaseService } from '../base';
import { DomService } from '../dom';
import { TextService } from '..';
import _dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { IAddress } from '../../interfaces';
import { ValidationErrors } from '@angular/forms';
import { FORM_FILED_ERROR_MSG } from '../../constants/error.constants';

const dayjs = _dayjs;

dayjs.extend(utc);

@Injectable({
  providedIn: 'root',
})
export class UtilsService extends BaseService {
  private mobileMenuOpen = false;

  constructor(public injector: Injector, public domSrv: DomService, private textSrv: TextService) {
    super(injector);
  }

  /**
   * Load scripts programatically
   */
  public loadScript(scriptData: any): void {
    // Create script element
    if (!this.domSrv.isPlatformBrowser()) {
      return;
    }
    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.src = scriptData.src;

    if (scriptData.defer) {
      script.defer = true;
    }

    if (scriptData.async) {
      script.async = true;
    }

    if (scriptData.onload) {
      script.onload = scriptData.onload;
    }

    if (scriptData.id) {
      script.id = scriptData.id;
    }

    // append the script tag in the DOM
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  /**
   * checks status of mobile menu
   */
  public isMobileMenuOpen(): boolean {
    return this.mobileMenuOpen;
  }

  /**
   * Clears zip
   */
  public clearCP(address: any): void {
    address.zip = '';
  }

  /**
   * adds class to mobile component, so it moves into the viewport
   */
  public openMobileMenu(): void {
    document.getElementsByTagName('body')[0].style.overflow = 'hidden';
    this.domSrv.addClasses('.is-mobile', ['mobile-menu-open']);
    this.mobileMenuOpen = true;
  }

  /**
   * removes class from mobile component, so it moves out the viewport
   */
  public closeMobileMenu(): void {
    if (this.isMobileMenuOpen()) {
      document.getElementsByTagName('body')[0].style.overflow = 'auto';
      this.domSrv.removeClasses('.is-mobile', ['mobile-menu-open']);
      this.mobileMenuOpen = false;
    }
  }

  /**
   * Get html for privacy text checkbox
   */
  public getPrivacyText(newsletter?: boolean): string {
    let text = newsletter
      ? this.textSrv.getText('I have read and accept the privacy policy.')
      : this.textSrv.getText('I have read and accept the conditions and the privacy policy.');

    const links = {
      a1: this.textSrv.getText('Condiciones_de_uso_y_compra_CF'),
      a2: this.textSrv.getText('Politica_de_privacidad_y_de_cookies_CF'),
    };

    for (const key in links) {
      if (links[key]) {
        if (text.includes(key)) {
          text = text.replace(
            '{' + key + '}',
            '<a href="' + String(links[key]) + '"class="button-link privacy-button-link" target="_blank">'
          );
          text = text.replace('{/' + key + '}', '</a>');
        }
      }
    }

    return text;
  }

  /**
   * Return objects in array filtering by specific object key and value
   */
  public filterArrayByKeyValue(arrayObjects: any[], key: string, valueToFilter: string): any {
    return arrayObjects.filter((obj) => obj[key] === valueToFilter);
  }

  /**
   * Get full url
   */
  public getFullUrl(): string {
    // TODO: Universal fix needed
    if (this.domSrv.isPlatformBrowser()) {
      return window.location.href;
    }
  }

  /**
   * Transform raw data into DD/MM/YYY format
   */
  public dateForFront(date: string, format?: string): string {
    if (!format) {
      // format = 'DD/MM/YYYY';
      format = this.textSrv.getText('formatDate');
    }

    return dayjs(date).format(format);
  }

  /**
   * Parsers numbers to show in front
   */
  public numberForFront(value: any): string {
    let decimalSep = ',';
    let millarSep = '.';

    decimalSep = this.textSrv.getText('decimalSep');
    millarSep = this.textSrv.getText('millarSep');

    if (isNaN(value)) {
      value = 0;
    }

    return parseFloat(value)
      .toFixed(2)
      .replace(/./g, (c, i, a) => (i && c !== '.' && (a.length - i) % 3 === 0 ? millarSep + c : c === '.' ? decimalSep : c));
  }

  /**
   * Check if string is well formatted
   */
  public isValidName(value: string): boolean {
    const formRegex = new RegExp(
      // eslint-disable-next-line no-useless-escape
      '^(?=.*[a-zA-Z0-9ÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÑÝÇàáâãäåèéêëìíîïòóôõöùúûüñýÿçß.,;\'!?+&\d_])' +
      // eslint-disable-next-line no-useless-escape
      '([a-zA-Z0-9ÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÑÝÇàáâãäåèéêëìíîïòóôõöùúûüñýÿçß.,;\'!?+&\d_ \-]+)$'
    );

    return formRegex.test(value);
  }

  /**
   * template for user
   */
  public userTemp(): any {
    return {
      email: '',
      password: '',
      repassword: '',
      name: '',
      notificationLanguage: '',
      surnames: '',
      phone: {
        prefix: '',
        number: '',
      },
      newsletterCats: [],
      paymentMethods: [],
      addresses: [],
      selectedAddress: {
        country: '',
      },
    };
  }

  /**
   * address template
   */
  public addressTemp(): IAddress {
    return {
      name: '',
      surnames: '',
      street: '',
      number: '',
      details: '',
      province: '',
      country: '',
      id: '',
      addressId: '',
      city: '',
      zip: '',
      phone: { prefix: '', number: '' },
      gift: false,
    };
  }

  /*
   * Prevent default in event
   */
  public pd(e: Event): void {
    e.preventDefault();
  }

  /**
   * Get base64 of png pixel
   */
  public getPixelPNG(): string {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCA' + 'QAAAAnOwc2AAAAD0lEQVR42mNkwAIYh7IgAAVVAAuInjI5AAAAAElFTkSuQmCC';
  }

  public getBrowser(): any {
    if (!this.domSrv.isPlatformBrowser()) {
      return;
    }

    const uAgent = navigator.userAgent;

    if (uAgent.indexOf('Edg') !== -1 || uAgent.indexOf('Edge') !== -1) {
      return 'edge';
    }

    if (uAgent.indexOf('Chrome') !== -1) {
      return 'chrome';
    }

    if (uAgent.indexOf('Safari') !== -1) {
      return 'safari';
    }
  }

  public fromCamelCaseToDased(word: string): string {
    return word.replace(/([A-Z])/g, (g) => '-' + g[0].toLowerCase());
  }

  public mapFormFieldErrors(errors: ValidationErrors | null): string {
    if (errors) {
      const errKey: string = Object.keys(errors)[0];
      const fieldErr = FORM_FILED_ERROR_MSG[errKey](errors[errKey]?.requiredLength) || '';

      if ((fieldErr as { id: string; replacements: any }).id) {
        return this.textSrv.getText(
          (fieldErr as { id: string; replacements: any }).id,
          (fieldErr as { id: string; replacements: any }).replacements
        );
      }

      return this.textSrv.getText(fieldErr as string);
    }

    return '';
  }
}
