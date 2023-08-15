import { Component, Injector, AfterViewInit, OnDestroy } from '@angular/core';
import { BasePage } from '@app/pages';
import { AuthService, EventService, CountryService, CheckDataService } from '@app/services';
import { TranslocoService } from '@ngneat/transloco';
import { map, tap } from 'rxjs';
import { CardService } from '../../../farmers-market/services/card.service';
import { FarmersMarketService } from '../../../farmers-market/farmers-market.service';
import { PROJECT_TYPE } from '@constants/landing.constants';
import { AddressResource } from '@resources/address/address.resource';
import { Favourites, FavouriteStoragePosition } from '../../../../interfaces/favourites.interface';

@Component({
  selector: 'my-favourites',
  templateUrl: './my-favourites.page.html',
  styleUrls: ['./my-favourites.page.scss'],
})
export class MyFavouritesPageComponent extends BasePage implements AfterViewInit, OnDestroy {
  favouriteSectionTabs = [this.translocoSrv.translate('global.adoptions.button'), this.translocoSrv.translate('global.boxes.button')];
  pageLimit = 12;
  favouriteSaved: Favourites = {
    adoptions: {
      list: [],
      totalFavs: null,
    },
    boxes: {
      list: [],
      totalFavs: null,
    },
  };

  currentPage = 1;
  resetPosition: FavouriteStoragePosition = { tab: 0, adoptions: { page: 1, param: 0 }, boxes: { page: 1, param: 0 } };

  totalPages: number;
  activePosition$ = this.favouriteService.activePosition$;
  projectType$ = this.favouriteService.projectType$;

  favourites$ = this.favouriteService.getFavourites$.pipe(
    map((favourites) => {
      if (!favourites.adoptions.totalFavs && favourites.boxes.totalFavs && this.favouriteService.isFirstLoad$.getValue()) {
        this.activePosition$.next({ tab: 1, adoptions: { page: 1, param: 0 }, boxes: { page: 1, param: 0 } });
        this.projectType$.next(PROJECT_TYPE.BOXES);
        this.favouriteService.isFirstLoad$.next(false);
      }

      favourites[this.projectType$.getValue()].totalFavs === this.activePosition$.getValue()[this.projectType$.getValue()].param &&
        this.resetPagination();

      this.currentPage =
        this.projectType$.getValue() === PROJECT_TYPE.ADOPTIONS
          ? this.activePosition$.getValue().adoptions.page
          : this.activePosition$.getValue().boxes.page;

      return favourites[this.projectType$.getValue()];
    }),
    tap((_) => {
      this.setInnerLoader(false, true);
      this.eventSrv.dispatchEvent('private-zone-url', { router: this.routerSrv.getPath() });
    })
  );

  constructor(
    public injector: Injector,
    public authSrv: AuthService,
    public eventSrv: EventService,
    public countrySrv: CountryService,
    public checkSrv: CheckDataService,
    public addressSrv: AddressResource,
    public translocoSrv: TranslocoService,
    public cardSrv: CardService,
    public farmersMarketSrv: FarmersMarketService
  ) {
    super(injector);
  }

  private resetPagination(): void {
    this.activePosition$.next({
      ...this.activePosition$.getValue(),
      [this.projectType$.getValue()]: {
        page: this.activePosition$.getValue()[this.projectType$.getValue()].page - 1,
        param: this.activePosition$.getValue()[this.projectType$.getValue()].param - this.pageLimit,
      },
    });

    this.favouriteService.getFavouritesSubject$.next({
      start: this.activePosition$.getValue()[this.projectType$.getValue()].param,
    });
  }

  changeTab(tab: number): void {
    this.projectType$.next(tab === 0 ? PROJECT_TYPE.ADOPTIONS : PROJECT_TYPE.BOXES);
    this.activePosition$.getValue().tab = tab;

    this.favouriteService.getFavouritesSubject$.next({
      start: this.activePosition$.getValue()[this.projectType$.getValue()].param,
    });
  }

  navigateToCatalogue(): void {
    const routeToNavigate = this.projectType$.getValue() === PROJECT_TYPE.ADOPTIONS ? 'ADOPTION' : 'BOXES';

    this.routerSrv.navigateToFarmersMarket(routeToNavigate);
  }

  changePage(page: number, type: any): void {
    const formatPage = (page - 1) * 12;

    this.favouriteService.getFavouritesSubject$.next({
      start: formatPage,
    });

    this.activePosition$.next({
      ...this.activePosition$.getValue(),
      [type]: { page, param: formatPage },
    });

    this.domSrv.scrollTo('#favourite-projects', -150);
  }

  ngAfterViewInit(): void {
    this.projectType$.next(PROJECT_TYPE.ADOPTIONS);
    this.favouriteService.getFavouritesSubject$.next({
      start: this.activePosition$.getValue()[this.projectType$.getValue()].param,
    });
  }

  ngOnDestroy(): void {
    this.activePosition$.next(this.resetPosition);
    this.favouriteService.isFirstLoad$.next(true);
  }
}
