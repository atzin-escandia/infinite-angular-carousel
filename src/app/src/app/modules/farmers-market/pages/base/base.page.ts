import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CountryService, LangService, LoggerService, SeoService } from '@app/services';
import { FarmersMarketService } from '@modules/farmers-market/farmers-market.service';
import { Page } from '@modules/farmers-market/types/page.types';
import { Subscription } from 'rxjs';
import { CardService } from '../../services/card.service';
import { DATA_SEO, TYPE_SEO } from '@app/constants/data-seo.constant';

@Component({
  selector: 'base',
  template: '',
})
export class BasePageComponent implements OnInit, OnDestroy {
  public type: Page;
  private langSubscription: Subscription;

  constructor(
    public loggerSrv: LoggerService,
    public farmersMarketSrv: FarmersMarketService,
    public route: ActivatedRoute,
    public seoSrv: SeoService,
    public router: Router,
    public langSrv: LangService,
    public countrySrv: CountryService,
    public cardSrv: CardService
  ) {}

  ngOnInit(): void {
    this.farmersMarketSrv.setCurrentPages();

    this.setSeo();
    this.initLangHandler();
  }

  /**
   * Set seo data and JSON meta
   */
  public setSeo(): void {
    this.seoSrv.set(this.getPath());

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

  ngOnDestroy(): void {
    this.langSubscription.unsubscribe();
  }
}
