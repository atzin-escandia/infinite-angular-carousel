import { AfterViewInit, Component, Injector, OnInit } from '@angular/core';
import { EcommerceBasePage } from '../../resources/ecommerce-base/ecommerce-base.page';
import { ArticleDTO } from '../../interfaces';
import { Seal } from '@app/interfaces';
import { SealsService } from '../../services/seals-services';
import { first, map, switchMap, tap } from 'rxjs/operators';
import { ECommerceService } from '../../services';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { MultiLangTranslationPipe } from '@app/pipes/multilang-translation';
import { E_COMMERCE_ROUTES } from '../../constant/routes.constant';
import { RouterService, TrackingService, TrackingConstants } from '@app/services';
import { ParseArticlesService } from '../../services/parse-articles/parse-articles.service';
import { TransferStateService } from '@app/services/transfer-state';
import { SKELETON_LENGTH } from '../../constant/skeleton-elements.constant';

@Component({
  selector: 'ec-catalog',
  templateUrl: './catalog.page.html',
  styleUrls: ['./catalog.page.scss'],
})
export class CatalogComponent extends EcommerceBasePage implements OnInit, AfterViewInit {
  /**
   * getDataSubs
   *
   * Subscripton to get data
   */
  getDataSubs: Subscription;

  /**
   * Complete articles List
   */
  articlesList: ArticleDTO[] = [];

  /**
   * Box shopping list
   */
  boxShoppingList: ArticleDTO[] = [];

  /**
   * country
   */
  country: string;
  detectChangeCountry = false;

  /**
   * Seals
   */
  allSeals: Seal[];

  /**
   * isLoading
   */
  isLoading = false;

  /**
   * routes
   */
  routes = E_COMMERCE_ROUTES;

  constructor(
    public injector: Injector,
    private sealsSrv: SealsService,
    private ecommerceSrv: ECommerceService,
    private multiTranslation: MultiLangTranslationPipe,
    private routerSrv: RouterService,
    private parseArticlesSrv: ParseArticlesService,
    private transferStateSrv: TransferStateService,
    public trackingSrv: TrackingService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.getPreviousData();
  }

  ngAfterViewInit(): void {
    const customEventData = {
      cf_page_title: TrackingConstants.GTM4.CF_PAGE_TITLE.ECOMMERCE_CATALOG,
      page_type: TrackingConstants.GTM4.PAGE_TYPE.ECOMMERCE_CATALOG,
      language: this.langSrv.getCurrentLang(),
      country_delivery: this.countrySrv.getCurrentCountry()?.iso,
    };

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PAGE_VIEW, false, customEventData);
  }

  /**
   * Create initial skeleton while loading data
   *
   * @returns ArticleDTO[]
   */
  createSkeleton(): ArticleDTO[] {
    return Array.from({ length: SKELETON_LENGTH }, (_, idx) => ({
      id: idx.toString(),
    }));
  }

  getPreviousData(): void {
    const seals$ = this.sealsSrv.getAll().pipe(first((val) => !!val));
    const currentCountry$ = this.ecommerceSrv.stateSrv.$currentCountry;

    this.isLoading = true;

    // Assign loading data skeleton
    this.articlesList = this.createSkeleton();

    this.getDataSubs = combineLatest([seals$, currentCountry$, this.parseArticlesSrv.getArticles() as Observable<ArticleDTO[]>])
      .pipe(
        map(([seals, country, shoppingList]) => {
          this.allSeals = seals.list;
          this.detectChangeCountry = this.country !== country;
          this.country = country;
          this.boxShoppingList = shoppingList;

          return country;
        }),
        switchMap((country) => {
          if (this.detectChangeCountry) {
            return this.ecommerceSrv.getCatalog(country);
          }

          return of({ list: this.articlesList });
        })
      )
      .subscribe({
        next: (data) => {
          if (data.list.length) {
            this.articlesList = this.parseArticlesSrv.setQuantityArticles(data.list, this.boxShoppingList);
          } else {
            this.routerSrv.navigate(E_COMMERCE_ROUTES.ERROR);
          }
          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
      });
  }

  getQuantity(articleData: ArticleDTO, boxShoppingList: ArticleDTO[]): number {
    return boxShoppingList?.find((item) => item.id === articleData.id)?.quantity || 0;
  }

  addArticleToShoppinBox(article: ArticleDTO): void {
    this.parseArticlesSrv.setBoxShoppingList(article);
    this.boxShoppingList = this.parseArticlesSrv.getShoppingCart();
  }

  goToDetail(e: Event, article: ArticleDTO): void {
    e.preventDefault();

    const detailPath = `${this.multiTranslation.transform(article._m_nameDetail)}`;

    this.routerSrv.navigateToEcommerce(this.parseArticlesSrv.parseDetailRoute(detailPath));
  }
}
