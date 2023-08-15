import { Injector } from '@angular/core';
import { Router } from '@angular/router';
import { CountryService, LangService, SeoService } from '@app/services';
import { Subscription } from 'rxjs';
import { DATA_SEO, TYPE_SEO } from '../../../../constants/data-seo.constant';
import { AutoUnsubscribe } from '../autounsubscribe/autounsubscribe.decorator';

@AutoUnsubscribe
export abstract class EcommerceBasePage {
  public seoSrv: SeoService;
  public router: Router;
  public langSrv: LangService;
  public countrySrv: CountryService;

  langSubscription: Subscription;

  constructor(public injector: Injector) {
    this.seoSrv = this.injector.get(SeoService);
    this.router = this.injector.get(Router);
    this.langSrv = this.injector.get(LangService);
    this.countrySrv = this.injector.get(CountryService);

    this.setSeo();
    this.initLangHandler();
  }

  /**
   * Set seo data and JSON meta
   */
  setSeo(params?: {title: string; description: string}): void {
    this.seoSrv.set(this.getPath(), params || null);
    this.seoSrv.addJson(TYPE_SEO, DATA_SEO);
  }

  /**
   * Get url path value
   */
  public getPath(): string {
    return this.router.url;
  }

  /**
   * Function o subscreibe language change to re-set seo data
   */
  private initLangHandler(): void {
    this.langSubscription = this.langSrv.getCurrent().subscribe(() => this.setSeo());
  }
}
