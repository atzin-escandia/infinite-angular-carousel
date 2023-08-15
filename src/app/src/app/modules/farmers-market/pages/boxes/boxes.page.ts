import { AfterViewInit, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService, CountryService, LangService, LoggerService, SeoService, TrackingConstants, TrackingService } from '@app/services';
import { FarmersMarketService } from '../../farmers-market.service';
import { CardService } from '../../services/card.service';
import { SellPageComponent } from '../sell/sell.page';
import { PAGE_TYPES } from '../../types/page.types';

@Component({
  selector: 'boxes',
  templateUrl: './boxes.page.html',
})
export class BoxesPageComponent extends SellPageComponent implements AfterViewInit {
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
    super(loggerSrv, farmersMarketSrv, configSrv, route, seoSrv, router, langSrv, countrySrv, cardSrv, trackingSrv);
    this.type = PAGE_TYPES.BOXES;
  }

  ngAfterViewInit(): void {
    const customEventData = {
      cf_page_title: TrackingConstants.GTM4.CF_PAGE_TITLE.FARMERS_MARKET_OVERHARVEST,
      page_type: TrackingConstants.GTM4.PAGE_TYPE.FARMERS_MARKET_OVERHARVEST,
      language: this.langSrv.getCurrentLang(),
      country_delivery: this.countrySrv.getCurrentCountry()?.iso,
    };

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PAGE_VIEW, false, customEventData);
  }
}
