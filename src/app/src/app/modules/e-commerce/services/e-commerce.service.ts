import { Injectable } from '@angular/core';
import { ResponseListDTO } from '@app/interfaces/response-dto.interface';
import { ConfigService, StateService } from '@app/services';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, finalize, map, switchMap } from 'rxjs/operators';
import { HIDE_INFO_BANNER } from '../constant/sections-available.constant';
import { ArticleDTO, RestrictionDTO } from '../interfaces';
import { ApiResource } from '../../../resources/api-obs';
import { OptionsApi } from '../../../resources/api-obs/interfaces/options.interface';

// Provisional
import { ParseArticlesService } from './parse-articles/parse-articles.service';
import { EC_CATALOG_PATH } from '../constant';
import { EC_CATALOG_ARTICLE_PATH, EC_CATALOG_ARTICLE_SLUG_PATH, EC_RESTRICTION_PATH } from '../constant/paths.constant';
import { RESTRICTION_COUNTRY_DATA } from '../constant/states.constant';
import { TransferStateService } from '@app/services/transfer-state';

@Injectable({
  providedIn: 'root',
})
export class ECommerceService {
  constructor(
    private configSrv: ConfigService,
    public stateSrv: StateService,
    private apiRsc: ApiResource,
    private parseArticlesSrv: ParseArticlesService,
    public transferStateSrv: TransferStateService
  ) {}

  /**
   * isoCurrentCountry
   */
  private isoCurrentCountry: string;

  /**
   * Show, hide and show info banner
   * isBannerEnabled: if true show banner, if false hide banner
   */
  isBannerEnabled(): boolean {
    const bannerFlag = localStorage.getItem(HIDE_INFO_BANNER);

    return !bannerFlag;
  }

  setStorageBanner(): void {
    localStorage.setItem(HIDE_INFO_BANNER, 'true');
  }

  removeStorageBanner(): void {
    localStorage.removeItem(HIDE_INFO_BANNER);
  }

  setCurrentCountry(isoCountry: string): void {
    this.isoCurrentCountry = isoCountry;
  }

  getCurrentCountry(): string {
    return this.isoCurrentCountry;
  }

  /**
   * Parsing firebase values of countries available for ecommerce
   *
   * @returns
   */
  availablesCountriesValues(): Observable<string[]> {
    return this.stateSrv.eCommerceAvailableDestinationCountries().pipe(
      map((res) => {
        if (res) {
          if (res._value) {
            return JSON.parse(res._value);
          }
        }

        return;
      })
    );
  }

  /**
   * Check the ecommerce section is available in the country of delivery
   *
   * @returns
   */
  isEcommerceAvailable(): Observable<boolean | null> {
    const remoteConfig$ = this.configSrv.isRemoteConfigLoaded$;
    const currentCountry$ = this.stateSrv.$currentCountry;
    const isEcommerceAvailableData$ = this.stateSrv.isECommerceAvailable();
    const availableCountries$ = this.availablesCountriesValues();

    this.apiRsc.showLoader(true);

    return combineLatest([remoteConfig$, currentCountry$]).pipe(
      filter(([config, country]) => !!config && !!country),
      switchMap(([_, country]) => combineLatest([of(country), isEcommerceAvailableData$, availableCountries$])),
      map(([country, isEcommerceAvailable, countriesAvailables]) => {
        if (country && isEcommerceAvailable && countriesAvailables) {
          this.apiRsc.hideLoader(true);
          this.setCurrentCountry(country);

          return countriesAvailables.includes(country.toUpperCase()) && isEcommerceAvailable;
        }

        return;
      }),
      finalize(() => this.apiRsc.hideLoader(true))
    );
  }

  /**
   * Check the ecommerce banner and section is available
   *
   * @returns
   */
  isEcommerceBannerAvailable(): Observable<boolean | null> {
    const isECommerceBannerAvailable$ = this.stateSrv.isECommerceBannerAvailable();
    const isEcommerceAvailable$ = this.isEcommerceAvailable();

    return combineLatest([isECommerceBannerAvailable$, isEcommerceAvailable$]).pipe(
      map(([isEcommerceBannerAvailable, isEcommerceAvailable]) => isEcommerceBannerAvailable && isEcommerceAvailable)
    );
  }

  /**
   * get all products catalog
   * If the state exists in the store we return the value, otherwise we call the backend
   *
   * @param isoCountry country iso code
   * @returns
   */
  getCatalog(isoCountry: string): Observable<ResponseListDTO<ArticleDTO>> {
    const path = EC_CATALOG_PATH;
    const options: OptionsApi = {
      service: path,
      api: 'catapi',
      loader: true,
      params: [isoCountry],
    };

    return this.apiRsc.get(options).pipe(map((data) => this.parseArticlesSrv.setAvailableArticles(data)));
  }

  /**
   * get article detail
   * If the state exists in the store we return the value, otherwise we call the backend
   *
   * @param articleId article id
   * @param isoCountry country iso code
   * @returns
   */
  getArticleDetail(articleId: string, isoCountry: string): Observable<ArticleDTO> {
    const path = EC_CATALOG_ARTICLE_PATH;

    const options: OptionsApi = {
      service: path,
      api: 'catapi',
      loader: true,
      params: [articleId, isoCountry],
    };

    return this.apiRsc.get(options);
  }

  /**
   * get article detail
   * If the state exists in the store we return the value, otherwise we call the backend
   *
   * @param articleId article id
   * @param isoCountry country iso code
   * @returns
   */
  getArticleDetailBySlug(slug: string, isoCountry: string): Observable<ArticleDTO> {
    const path = EC_CATALOG_ARTICLE_SLUG_PATH;

    const options: OptionsApi = {
      service: path,
      api: 'catapi',
      loader: true,
      params: [slug, isoCountry],
    };

    return this.apiRsc.get(options);
  }

  /**
   * getRestrictionByCountry
   *
   * get restriction by country id
   *
   * @param idCountry
   * @returns
   */
  getRestrictionByCountry(isoCountry?: string): Observable<RestrictionDTO> {
    isoCountry = isoCountry || this.isoCurrentCountry;

    const options: OptionsApi = {
      service: EC_RESTRICTION_PATH,
      api: 'catapi',
      params: [isoCountry || this.isoCurrentCountry],
    };

    const restriction: RestrictionDTO = this.transferStateSrv.get(RESTRICTION_COUNTRY_DATA);

    if (restriction) {
      return of(restriction);
    }

    return this.apiRsc.get(options).pipe(
      map((res) => {
        this.transferStateSrv.set(RESTRICTION_COUNTRY_DATA, res[0]);

        return res[0];
      })
    );
  }
}
