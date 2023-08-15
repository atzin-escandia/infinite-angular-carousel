import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AuthService,
  CountryService,
  DomService,
  FavouriteService,
  LangService,
  RouterService,
  StateService,
  StorageService,
  TrackingService,
} from '@app/services';
import { FarmersMarketService } from '@modules/farmers-market/farmers-market.service';
import { TranslocoService } from '@ngneat/transloco';
import { CardService } from '../../services/card.service';
import { PAGE_TYPES } from '../../types/page.types';
import { CatalogueComponent } from '../catalogue/catalogue.component';

@Component({
  selector: 'adoptions-catalogue',
  templateUrl: './adoptions-catalogue.component.html',
  styleUrls: ['../catalogue/catalogue.component.scss'],
})
export class AdoptionsCatalogueComponent extends CatalogueComponent implements OnInit {
  constructor(
    public translocoSrv: TranslocoService,
    public langSrv: LangService,
    public routerSrv: RouterService,
    public route: ActivatedRoute,
    public router: Router,
    public location: Location,
    public farmersMarketSrv: FarmersMarketService,
    public countrySrv: CountryService,
    public cardSrv: CardService,
    public domSrv: DomService,
    public storageSrv: StorageService,
    public trackingSrv: TrackingService,
    public stateSrv: StateService,
    public favouriteSrv: FavouriteService,
    public authSrv: AuthService
  ) {
    super(
      translocoSrv,
      langSrv,
      routerSrv,
      route,
      router,
      location,
      farmersMarketSrv,
      countrySrv,
      cardSrv,
      domSrv,
      storageSrv,
      trackingSrv,
      favouriteSrv,
      authSrv
    );
  }

  ngOnInit(): void {
    this.type = PAGE_TYPES.ADOPTIONS;
    super.ngOnInit();
  }
}
