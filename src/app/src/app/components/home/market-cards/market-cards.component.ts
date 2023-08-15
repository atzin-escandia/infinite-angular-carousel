import { Component, Injector, OnInit } from '@angular/core';
import { FarmersMarketService } from '@modules/farmers-market/farmers-market.service';
import { RouterService, UpService } from '@app/services';

import { BaseComponent } from '@components/base';

@Component({
  selector: 'home-market-cards',
  templateUrl: './market-cards.component.html',
  styleUrls: ['./market-cards.component.scss'],
})
export class MarketCardsComponent extends BaseComponent implements OnInit {
  public idCategory: string;
  public categories = [];

  constructor(
    public injector: Injector,
    public routerSrv: RouterService,
    private upSrv: UpService,
    private farmersMarketSrv: FarmersMarketService
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    const categoriesReq = await this.upSrv.getCategories();

    categoriesReq.map((cat) => {
      if (cat.code !== '11') {
        this.categories.push(cat);
      }
    });
  }

  redirectFilters(name: string): void {
    this.routerSrv.navigate('search/', null, { categories: this.farmersMarketSrv.formatIdParam(name[this.langSrv.getCurrentLang()])});
  }
}
