import { AfterViewInit, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FarmersMarketService } from '../../farmers-market.service';
import { SellPageComponent } from '../sell/sell.page';
import {
  ConfigService,
  CountryService,
  FavouriteService,
  LangService,
  LoggerService,
  SeoService,
  TrackingConstants,
  TrackingService,
} from '@app/services';
import { CardService } from '../../services/card.service';
import { PAGE_TYPES } from '../../types/page.types';

@Component({
  selector: 'adoptions',
  templateUrl: './adoptions.page.html',
})
export class AdoptionsPageComponent extends SellPageComponent implements AfterViewInit {
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
    public trackingSrv: TrackingService,
    public favouriteSrv: FavouriteService
  ) {
    super(loggerSrv, farmersMarketSrv, configSrv, route, seoSrv, router, langSrv, countrySrv, cardSrv, trackingSrv);
    this.type = PAGE_TYPES.ADOPTIONS;
  }

  ngAfterViewInit(): void {
    const customEventData = {
      cf_page_title: TrackingConstants.GTM4.CF_PAGE_TITLE.FARMERS_MARKET_ADOPTIONS,
      page_type: TrackingConstants.GTM4.PAGE_TYPE.FARMERS_MARKET_ADOPTIONS,
      language: this.langSrv.getCurrentLang(),
      country_delivery: this.countrySrv.getCurrentCountry()?.iso,
    };

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PAGE_VIEW, false, customEventData);

    void this.favouriteSrv.setCrowdfarmer();
  }
}
