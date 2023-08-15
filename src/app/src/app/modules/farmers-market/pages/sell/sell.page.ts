import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FarmersMarketService } from '@modules/farmers-market/farmers-market.service';
import { FARMERS_MARKET_HERO } from '@modules/farmers-market/constants/hero.constants';
import { Hero } from '@modules/farmers-market/interfaces/hero.interface';
import { BasePageComponent } from '@modules/farmers-market/pages/base/base.page';
import { ConfigService, CountryService, LangService, LoggerService, SeoService, TrackingService } from '@app/services';
import { first } from 'rxjs/operators';
import { CardService } from '../../services/card.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'sell',
  template: '',
})
export class SellPageComponent extends BasePageComponent implements OnInit, OnDestroy {
  hero: Hero;
  currentLangSubscription: any;
  currentCountry: string;
  currentLang: string;
  public countrySubscription: Subscription;
  public agroupments;
  public isGiftActive: boolean;

  constructor(
    public loggerSrv: LoggerService,
    public farmersMarketSrv: FarmersMarketService,
    public configSrv: ConfigService,
    public route: ActivatedRoute,
    public seoSrv: SeoService,
    public router: Router,
    public langSrv: LangService,
    public countrySrv: CountryService,
    public cardSrv: CardService,
    public trackingSrv: TrackingService
  ) {
    super(loggerSrv, farmersMarketSrv, route, seoSrv, router, langSrv, countrySrv, cardSrv);
  }
  ngOnInit(): void {
    super.ngOnInit();
    this.hero = FARMERS_MARKET_HERO[this.type];
    this.currentLang = this.langSrv.getCurrentLang();

    this.configSrv.isRemoteConfigLoaded$.pipe(first((val) => !!val)).subscribe(() => {
      this.farmersMarketSrv.initFirebaseData(this.type);
      this.agroupments = this.farmersMarketSrv.getAvailableAgroupments(this.type);
    });

    this.currentCountry = this.countrySrv.getCountry();

    this.currentLangSubscription = this.langSrv.getCurrent().subscribe((lang) => {
      this.cardSrv.setCountryAndLang(this.currentCountry, lang);
      this.currentLang = lang;
    });

    this.countrySubscription = this.countrySrv.countryChange().subscribe(async () => {
      await this.farmersMarketSrv.setAvailableAgroupments(this.type);
      await this.farmersMarketSrv.getAllProjects(this.type, '', {});
    });
  }

  ngOnDestroy(): void {
    this.currentLangSubscription?.unsubscribe();
    this.countrySubscription?.unsubscribe();
  }
}
