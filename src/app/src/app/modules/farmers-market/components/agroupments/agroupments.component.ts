import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FarmersMarketService } from '@modules/farmers-market/farmers-market.service';
import { CardService } from '@modules/farmers-market/services/card.service';
import { ConfigService, CountryService, DomService, LangService, RouterService, StateService } from '@app/services';
import { Page } from '@modules/farmers-market/types/page.types';
import { ECommerceService } from '@app/modules/e-commerce/services';
import { Subscription } from 'rxjs';
import { UnknownObjectType } from '@app/interfaces';
import { AgroupmentService } from '@services/agroupments';
import { PROJECT_TYPE } from '@constants/landing.constants';
import { FavouritesSection } from '@interfaces/favourites.interface';

@Component({
  selector: 'agroupments',
  templateUrl: './agroupments.component.html',
})
export class AgroupmentsComponent implements OnInit, OnDestroy {
  @Input() agroupments: UnknownObjectType;
  @Input() type: Page;

  PROJECT_TYPE = PROJECT_TYPE;
  currentCountry: string;
  currentLang: string;

  currentLangSubscription: UnknownObjectType;
  ecommerceAvailableSub: Subscription;
  ecommerceBannerAvailable = false;

  dummySkeleton = {
    adoptions: [1, 2, 3],
    boxes: [1, 2, 3, 4],
  };

  FavSectionFM = FavouritesSection.FM;

  constructor(
    public cardSrv: CardService,
    public domSrv: DomService,
    public configSrv: ConfigService,
    public stateSrv: StateService,
    public farmersMarketSrv: FarmersMarketService,
    public routerSrv: RouterService,
    public agroupmentSrv: AgroupmentService,
    private langSrv: LangService,
    private countrySrv: CountryService,
    private ecommerceSrv: ECommerceService
  ) {}

  ngOnInit(): void {
    this.currentCountry = this.countrySrv.getCountry();
    this.initFirebaseConfig();
  }

  ngOnDestroy(): void {
    this.ecommerceAvailableSub.unsubscribe();
  }

  initFirebaseConfig(): void {
    this.ecommerceAvailableSub = this.ecommerceSrv.isEcommerceBannerAvailable().subscribe({
      next: (value) => (this.ecommerceBannerAvailable = value),
    });
    this.currentLang = this.langSrv.getCurrentLang();
  }

  navigateToEcommerce(): void {
    this.routerSrv.navigateToEcommerce();
  }
}
