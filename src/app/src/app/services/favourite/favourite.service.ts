/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Injectable, Injector } from '@angular/core';
import { UserService } from '../user';
import { Observable, map, tap, Subject, switchMap, catchError, BehaviorSubject, debounceTime, forkJoin, of } from 'rxjs';
import { ConfigService } from '../config';
import { BaseService } from '../base';
import { PROJECT_TRANSLATION } from '../../modules/farmers-market/components/utils/favourites.map';
import { ToastService } from '@crowdfarming/ds-library';
import { TranslocoService } from '@ngneat/transloco';
import { CountryService } from '../country';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  FAVOURITES_PARAMS,
  FavouriteInfo,
  FavouriteInfoReq,
  FavouriteParams,
  FavouritesSection,
  FavouriteStoragePosition,
  LOCAL_STORAGE_FAVORITE_KEY,
  FavouriteLocalStorage,
  Favourites,
  FavouriteTrackingParameters,
} from '@interfaces/favourites.interface';
import { PROJECT_TYPE } from '../../constants/landing.constants';
import { CardService } from '../../modules/farmers-market/services/card.service';
import { EventService } from '../event';
import { AuthService } from '../auth';
import { RouterService } from '../router';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DomService } from '../dom';
import { TrackingConstants, TrackingService } from '../tracking';
import { PAGE_TYPES } from '../../modules/farmers-market/types/page.types';
import { IEcommerceTracking } from '../../interfaces';
import { StorageService } from '../storage';

@Injectable({
  providedIn: 'root',
})
export class FavouriteService extends BaseService {
  crowdfarmer = void this.setCrowdfarmer();
  favouriteFirebase: any;
  isUserAccountSection: boolean;
  callLimit = 12;
  currentCountry = this.countrySrv.getCountry();

  noFavs: FavouriteParams = {
    isFavFMActive: false,
    isFavHomeActive: false,
    isFavLandingActive: false,
    isFavUAActive: false,
  };

  favouriteInfo: FavouriteInfoReq = {
    type: null,
    isFavourite: false,
    platform: 'WEB',
    source: null,
    country: this.currentCountry,
  };

  isFirstLoad$ = new BehaviorSubject<boolean>(true);
  projectType$ = new BehaviorSubject<string>(PROJECT_TYPE.ADOPTIONS);
  currentSection$ = new BehaviorSubject<string>(FavouritesSection.HOME);
  parametersForTracking$ = new BehaviorSubject<FavouriteTrackingParameters>({
    project: null,
    tracking: { index: 0, agroupmentName: null },
    type: null,
    source: null,
    path: null,
  });

  getFavouritesSubject$ = new Subject<{ start: number }>();
  getFavourites$: Observable<any> = this.getFavouritesSubject$.pipe(
    switchMap((params) => {
      this.setInnerLoader(true, true);

      return this.getFavouritesProjects(params.start);
    }),
    catchError((_, favourite) => favourite),
    debounceTime(300),
    tap((_) => this.setCrowdfarmer())
  );

  activePosition$ = new BehaviorSubject<FavouriteStoragePosition>({
    tab: 0,
    adoptions: { page: 1, param: 0 },
    boxes: { page: 1, param: 0 },
  });

  saveFavouriteSubject$ = new Subject<FavouriteInfo>();
  saveFavourite$ = this.saveFavouriteSubject$.pipe(
    switchMap((data) => this.saveFavourites(data.data, data.id)),
    catchError((_, favouriteData) => {
      this.showErrorToast();

      return favouriteData;
    }),
    tap((response) => {
      this.toastSrv.pushToast({
        text: response.data.availableDates
          ? this.translocoSrv.translate('notification.favourite-added.text-info')
          : this.translocoSrv.translate('notification.favourite-added-not-available.text-info'),
        icon: 'heart-on',
        type: 'danger',
        isClosable: true,
      });

      const parameter$ = this.parametersForTracking$.getValue();

      this.setTrackEvent(
        true,
        parameter$.project,
        parameter$.tracking,
        parameter$.type,
        parameter$.source,
        parameter$.path,
        response.data.availableDates,
        parameter$.isMiniCartGA4
      );
    }),
    tap((favouriteData) => {
      this.crowdfarmer = this.userSrv.getCurrentUser();
      const updateUser = { ...this.crowdfarmer, favourites: favouriteData.data.favourites };

      this.userSrv.setOnStorage(updateUser);
      this.crowdfarmer = updateUser;
    })
  );

  removeFavouriteSubject$ = new Subject<FavouriteInfo>();
  removeFavourite$ = this.removeFavouriteSubject$.pipe(
    tap((data) => this.currentSection$.next(data.data.source)),
    switchMap((data) => this.removeFavourites(data.data, data.id)),
    catchError((_, favouriteData) => {
      this.showErrorToast();

      return favouriteData;
    }),
    tap((_) => {
      this.toastSrv.pushToast({
        text: this.translocoSrv.translate('notification.favourite-deleted.text-info'),
        icon: 'heart-off',
        type: 'danger',
        isClosable: true,
      });

      const parameter$ = this.parametersForTracking$.getValue();

      this.setTrackEvent(false, parameter$.project, parameter$.tracking, parameter$.type, parameter$.source, parameter$.path);

      this.currentSection$.getValue() === FavouritesSection.USER_ACCOUNT && this.domSrv.scrollToTop();
    }),
    tap((favouriteData) => {
      this.crowdfarmer = this.userSrv.getCurrentUser();
      const updateUser = { ...this.crowdfarmer, favourites: favouriteData.data.favourites };

      this.userSrv.setOnStorage(updateUser);
      this.crowdfarmer = updateUser;
    }),
    debounceTime(300),
    tap(
      (_) =>
        this.isUserAccountSection &&
        this.getFavouritesSubject$.next({
          start: this.activePosition$.getValue()[this.projectType$.getValue()].param,
        })
    )
  );

  constructor(
    public injector: Injector,
    private userSrv: UserService,
    public configSrv: ConfigService,
    public toastSrv: ToastService,
    public translocoSrv: TranslocoService,
    public countrySrv: CountryService,
    public cardSrv: CardService,
    private http: HttpClient,
    private eventSrv: EventService,
    private authSrv: AuthService,
    public routerSrv: RouterService,
    public route: ActivatedRoute,
    public location: Location,
    public domSrv: DomService,
    public trackingSrv: TrackingService,
    private storageSrv: StorageService
  ) {
    super(injector);
    this.saveFavourite$.subscribe();
    this.removeFavourite$.subscribe();
    this.countrySrv.countryChange().subscribe((country) => {
      this.currentCountry = country;
    });
  }

  setCrowdfarmer(): void {
    this.crowdfarmer = this.userSrv.getCurrentUser();
  }

  saveFavourites(favouriteInfo: FavouriteInfoReq, id: string): Observable<any> {
    return this.http.post(`${environment.capi.host}v1/crowdfarmers/favourites/mark/${id}`, favouriteInfo);
  }

  removeFavourites(favouriteInfo: FavouriteInfoReq, id: string): Observable<any> {
    return this.http.post(`${environment.capi.host}v1/crowdfarmers/favourites/unmark/${id}`, favouriteInfo);
  }

  getFavouritesProjects(start: number): Observable<any> {
    const params = {
      country: this.currentCountry,
      start,
      limit: this.callLimit,
    };

    const favAdoptions$: Observable<any> = this.http.get(
      `${environment.capi.host}v1/crowdfarmers/favourites/${PROJECT_TRANSLATION.get(PROJECT_TYPE.ADOPTIONS)}`,
      { params }
    );
    const favBoxes$: Observable<any> = this.http.get(
      `${environment.capi.host}v1/crowdfarmers/favourites/${PROJECT_TRANSLATION.get(PROJECT_TYPE.BOXES)}`,
      {
        params,
      }
    );

    return forkJoin([favAdoptions$, favBoxes$]).pipe(
      switchMap(([favAdoptions, favBoxes]) => {
        const favorites: Favourites = {
          adoptions: { list: favAdoptions.data.list, totalFavs: favAdoptions.data.metadata.total },
          boxes: { list: favBoxes.data.list, totalFavs: favBoxes.data.metadata.total },
        };

        return of(favorites);
      })
    );
  }

  showErrorToast(): void {
    this.toastSrv.pushToast({
      text: this.translocoSrv.translate('notification.action-error.text-info'),
      icon: 'alert-triangle',
      type: 'danger',
      isClosable: true,
    });
  }

  handleFavourite(
    project: any,
    tracking: { index: number; agroupmentName: string },
    type: string,
    source: string = FavouritesSection.FM,
    isSavedBeforeLogin = false,
    isMiniCartGA4 = false
  ): void {
    let scrollPosition: number;
    let saveFavInfo: FavouriteLocalStorage;
    const url = this.routerSrv.removeUrlLang(this.location.path());

    this.parametersForTracking$.next({
      project,
      tracking: { index: tracking.index, agroupmentName: tracking.agroupmentName },
      type,
      source,
      path: url,
      isMiniCartGA4,
    });

    if (!this.authSrv.isLogged()) {
      setTimeout(() => {
        scrollPosition = this.domSrv.scrollPosition$.getValue();

        saveFavInfo = {
          project,
          type,
          source,
          index: tracking.index,
          agroupmentName: tracking.agroupmentName,
          path: url,
          scroll: scrollPosition,
        };

        this.storageSrv.set(LOCAL_STORAGE_FAVORITE_KEY, saveFavInfo);
        this.routerSrv.navigate('/login-register');
      }, 10);

      return;
    }

    this.toastSrv.clearToasts();
    this.favouriteInfo.type = PROJECT_TRANSLATION.get(type);
    this.favouriteInfo.source = source;

    const id = project.up.id || project.cart?._up || project._id;

    if (!this.isFavourite(type, id) || isSavedBeforeLogin) {
      this.saveFavouriteSubject$.next({ id, data: this.favouriteInfo });
    } else {
      this.removeFavouriteSubject$.next({ id, data: this.favouriteInfo });
      this.projectType$.next(type);
      this.isUserAccountSection = source === FavouritesSection.USER_ACCOUNT;
    }
  }

  isFavourite(type: string, id: string): boolean {
    if (this.authSrv.isLogged() && this.crowdfarmer?.favourites) {
      return this.crowdfarmer.favourites[PROJECT_TRANSLATION.get(type)]?.includes(id);
    }

    return false;
  }

  setTrackingGA4IdImpressions(source: string, type: string, route: string, isMiniCartGA4 = false): string {
    if (route.includes('?q=')) {
      source = source === FavouritesSection.CROSS_SELLING ? 'Search_CS' : 'Search';
    }

    if (route.includes('tab=all')) {
      type = 'all';
    }

    if (route.includes('=cart')) {
      source = 'Crosselling_Cart';
    }

    if (isMiniCartGA4) {
      source = 'Crosselling_Mini_cart';
    }

    if (this.parametersForTracking$.getValue().tracking.agroupmentName) {
      const formatAgroupmentName = this.trackingSrv.buildListName(this.parametersForTracking$.getValue().tracking.agroupmentName);

      return `${TrackingConstants.WISHLIST[source][type.toUpperCase()]}/${formatAgroupmentName}`;
    }

    let itemName = TrackingConstants.WISHLIST[source][type.toUpperCase()];

    if (source === 'Search' && type === 'All') {
      const firstLetter = this.parametersForTracking$.getValue().type.charAt(0).toUpperCase();
      const restOfWord = this.parametersForTracking$.getValue().type.slice(1);

      itemName += `/${firstLetter + restOfWord}`;
    }

    return itemName;
  }

  setTrackEvent(
    add: boolean,
    project: any,
    tracking: { index: number; agroupmentName: string },
    type: string,
    source: string,
    route: string,
    inSeason?: boolean,
    isMiniCartGA4 = false
  ): void {
    if (!type || !project) {
      return;
    }

    const items = [];
    const listName = this.setTrackingGA4IdImpressions(source, type, route, isMiniCartGA4);
    let customInfoFav;

    this.trackingSrv.setPosition(tracking.index + 1);

    if (add) {
      // TODO: fill in with IEcommerceTracking
      items.push({
        index: tracking.index ? tracking.index + 1 : 0,
        item_brand: project.farm?._m_name?.en || project._m_farmName?.en,
        currency: this.countrySrv.getCurrentCountry().currency,
        price:
          (type === PAGE_TYPES.ADOPTIONS ? project.filters?.price?.amount : project.filters?.ohPrice?.amount) ||
          project.price?.amount ||
          project.masterBoxes[0].price.amount,
        item_variant: type === PAGE_TYPES.ADOPTIONS ? TrackingConstants.ITEM_VARIANT.ADOPT : TrackingConstants.ITEM_VARIANT.OH,
        quantity: 1,
        item_category: project.up?.categoryName || project._m_category?.en,
        item_category2: project.up?.subcategoryName,
        item_category3: project.up?._m_variety?.en,
        item_category4: project.up?.subvariety,
        item_list_name: listName,
        item_name: project.code,
        product_code: project.code,
      } as IEcommerceTracking);

      customInfoFav = {
        type: inSeason ? 'in_season' : 'out_of_season',
        location: listName,
        currency: this.countrySrv.getCurrentCountry().currency,
        price:
          (type === PAGE_TYPES.ADOPTIONS ? project.filters?.price?.amount : project.filters?.ohPrice?.amount) ||
          project.price?.amount ||
          project.masterBoxes[0].price.amount,
      };

      this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.ADD_TO_WISHLIST, true, { items }, customInfoFav);
    } else {
      customInfoFav = {
        product_name: project.up?._m_production?.en || project._m_title?.en,
        product_id: project.up?.id || project.cart?._up,
        product_brand: project.farm?._m_name?.en || project._m_farmName?.en,
        product_category: project.up?.category,
        product_price:
          (type === PAGE_TYPES.ADOPTIONS ? project.filters?.price?.amount : project.filters?.ohPrice?.amount) || project.price?.amount,
      };

      this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.REMOVE_FROM_WISHLIST, true, null, customInfoFav);
    }
  }

  handleSavedFavourite(redirection = false): void {
    const savedFav: FavouriteLocalStorage = this.storageSrv.get(LOCAL_STORAGE_FAVORITE_KEY);

    if (redirection) {
      !this.domSrv.scrollPosition$.getValue() && this.domSrv.scrollPosition$.next(savedFav.scroll);

      savedFav.source.includes('?q=')
        ? this.scrollAndSaveFavouriteAfterLogin(savedFav, true)
        : this.scrollAndSaveFavouriteAfterLogin(savedFav);

      this.routerSrv.navigate(savedFav.path);
    } else {
      this.scrollAndSaveFavouriteAfterLogin(savedFav);
    }
  }

  scrollAndSaveFavouriteAfterLogin(savedFav: FavouriteLocalStorage, wait = false): void {
    wait
      ? setTimeout(() => {
          this.domSrv.scrollSubject$.next();
        }, 3000)
      : this.domSrv.scrollSubject$.next();

    this.handleFavourite(
      savedFav.project,
      { index: savedFav.index, agroupmentName: savedFav.agroupmentName },
      savedFav.type,
      savedFav.source,
      true
    );
    this.storageSrv.clear(LOCAL_STORAGE_FAVORITE_KEY);
  }

  setInnerLoader(set: boolean, page: boolean): void {
    this.eventSrv.dispatchEvent('loading-animation', { set, isPage: page });
  }

  favouriteFirebaseParams$: Observable<FavouriteParams> = this.configSrv
    .getValue(FAVOURITES_PARAMS)
    .pipe(map((config) => JSON.parse(config._value)));

  favouriteFM$: Observable<boolean> = this.favouriteFirebaseParams$.pipe(map((params) => params.isFavFMActive));
  favouriteUA$: Observable<boolean> = this.favouriteFirebaseParams$.pipe(map((params) => params.isFavUAActive));
  favouriteLanding$: Observable<boolean> = this.favouriteFirebaseParams$.pipe(map((params) => params.isFavLandingActive));
}
