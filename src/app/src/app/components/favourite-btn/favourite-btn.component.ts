import { Component, Injector, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService, ConfigService, DomService, FavouriteService, StorageService } from '../../services';
import { PROJECT_TYPE } from '../../constants/landing.constants';
import { FavouritesSection, LOCAL_STORAGE_FAVORITE_KEY } from '@interfaces/favourites.interface';
import { Location } from '@angular/common';
import { Observable, first, map } from 'rxjs';

@Component({
  selector: 'favourite-btn',
  templateUrl: './favourite-btn.component.html',
  styleUrls: ['./favourite-btn.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FavouriteBtnComponent implements OnInit {
  @Input() hasFavourite: boolean;
  @Input() isOH: boolean;
  @Input() isCrossellingBottom = false;
  @Input() isCrossellingLateral = false;
  @Input() project: any;
  @Input() index: number;
  @Input() path = FavouritesSection.FM;
  @Input() agroupmentName: string;

  id: string;
  type: string;
  isFavourite: boolean;
  ICON_SIZE = 'm';
  ICON_NAME = 'heart';
  isFavouriteEnabled$: Observable<boolean>;

  constructor(
    public injector: Injector,
    public favouriteSrv: FavouriteService,
    public domSrv: DomService,
    public location: Location,
    private authSrv: AuthService,
    private configSrv: ConfigService,
    private storageSrv: StorageService
  ) {

    this.configSrv.isRemoteConfigLoaded$.pipe(first((val) => !!val)).subscribe(() => {
      this.isFavouriteEnabled$ = this.favouriteSrv.favouriteFirebaseParams$.pipe(
        map((params) => params[`isFav${this.path}Active`])
      );
    });
  }

  ngOnInit(): void {
    this.id = this.project.up?.id || this.project.cart?._up || this.project._id;
    this.type = this.isOH ? PROJECT_TYPE.BOXES : PROJECT_TYPE.ADOPTIONS;
    this.storageSrv.get(LOCAL_STORAGE_FAVORITE_KEY) && this.authSrv.isLogged() && this.favouriteSrv.handleSavedFavourite(false);
  }

  manageClick(e: any, index: number): void {
    this.domSrv.setScrollPosition(e.pageY);
    this.favouriteSrv.handleFavourite(
      this.project,
      { index, agroupmentName: this.agroupmentName },
      this.type,
      this.path,
      false,
      this.isCrossellingLateral
    );
  }
}
