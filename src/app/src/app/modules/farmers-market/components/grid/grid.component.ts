import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomService, RouterService, StorageService } from '@app/services';
import { Banner } from '@modules/farmers-market/interfaces/banner.interface';
import { Hero } from '@modules/farmers-market/interfaces/hero.interface';
import { Page } from '@modules/farmers-market/types/page.types';
import { FarmersMarketService } from '../../farmers-market.service';
import { CardService } from '../../services/card.service';
@Component({
  selector: 'grid',
  templateUrl: './grid.component.html',
})
export class GridComponent implements OnChanges, OnInit {
  @Input() agroupments: {
    top: {
      name: '';
      projects: any[];
    };
    bottom: {
      name: '';
      projects: any[];
    };
  };

  @Input() topBanner: Banner;
  @Input() bottomBanner: Banner;
  @Input() type: Page;
  @Input() hero: Hero;

  constructor(
    public routerSrv: RouterService,
    public cardSrv: CardService,
    public route: ActivatedRoute,
    public storageSrv: StorageService,
    public farmersMarketSrv: FarmersMarketService,
    public domSrv: DomService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.topBanner?.previousValue !== changes.topBanner?.currentValue) {
      this.topBanner = changes.topBanner.currentValue;
    }

    if (changes.bottomBanner?.previousValue !== changes.bottomBanner?.currentValue) {
      this.bottomBanner = changes.bottomBanner.currentValue;
    }

    if (changes.agroupments?.previousValue !== changes.agroupments?.currentValue) {
      this.agroupments = changes.agroupments.currentValue;
      this.cardSrv.setType(this.type);
    }
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const search = params.q || '';
      const queryParamsCode =
        this.farmersMarketSrv.getParamsFromReq(params,
        this.route.snapshot.params.lang);

      const sort = this.farmersMarketSrv.getSortingKey();

      void this.farmersMarketSrv.getAllProjects(this.type, search, {...queryParamsCode, sort});
    });
  }

  search(searchTerm: string): void {
    searchTerm !== '' && this.routerSrv.navigate('search', null, { q: searchTerm, tab: this.type });
  }
}
