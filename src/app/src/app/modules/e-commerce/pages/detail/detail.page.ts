import { AbstractType, Component, Injector, OnInit } from '@angular/core';
import { HeaderSeal, Seal } from '@app/interfaces';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { first } from 'rxjs/operators';
import { ArticleDTO } from '../../interfaces';
import { EcommerceBasePage } from '../../resources/ecommerce-base/ecommerce-base.page';
import { ECommerceService } from '../../services';
import { ParseArticlesService } from '../../services/parse-articles/parse-articles.service';
import { SealsManagerService, SealsService } from '../../services/seals-services';
import { CartsService, RouterService, TrackingConstants, TrackingService } from '@app/services';
import { ActivatedRoute } from '@angular/router';
import { MultiLangTranslationPipe } from '@app/pipes/multilang-translation/multilang-translation.pipe';
import { TranslocoService } from '@ngneat/transloco';
import { ResponseListDTO } from '@app/interfaces/response-dto.interface';

@Component({
  selector: 'ec-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPageComponent extends EcommerceBasePage implements OnInit {
  detailData: ArticleDTO;

  /**
   * seals
   */
  detailSeals: HeaderSeal[];
  farmerSeals: Seal[];
  upSeals: Seal[];

  /**
   * isLoading
   */
  isLoading = false;

  /**
   * getDataSub
   */
  getDataSub: Subscription;

  /**
   * getRouteSub
   */
  getRouteSub: Subscription;

  /**
   * shoppingList
   */
  shoppingList: ArticleDTO[];

  /**
   * isCheckingCart
   */
  isCheckingCart = false;

  /**
   * originalLang
   */
  originalLang: string;

  constructor(
    public injector: Injector,
    public routerSrv: RouterService,
    private sealsSrv: SealsService,
    private sealsManagerSvr: SealsManagerService,
    private ecommerceSrv: ECommerceService,
    private parseArticlesSrv: ParseArticlesService,
    private activatedRoute: ActivatedRoute,
    private translocoService: TranslocoService,
    public trackingSrv: TrackingService,
    private multiTranslation: MultiLangTranslationPipe
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.getRouteSub = this.activatedRoute.paramMap.subscribe((params: any) => {
      const newLang = this.activatedRoute.parent.snapshot.params.lang;

      !this.originalLang && (this.originalLang = this.activatedRoute.parent.snapshot.params.lang);

      this.originalLang === newLang && this.getData(params.params.detail);
    });
  }

  getData(detailDataSlug: string): void {
    this.isLoading = true;

    const isoCountry = this.ecommerceSrv.getCurrentCountry();
    const seals$ = this.sealsSrv.getAll().pipe(first((val) => !!val));
    const detailData$ = this.ecommerceSrv.getArticleDetailBySlug(detailDataSlug, isoCountry).pipe(first((val) => !!val));

    this.getDataSub = combineLatest({
      seals: seals$,
      detailData: detailData$,
      shoppingList: this.parseArticlesSrv.getArticles() as Observable<ArticleDTO[]>,
    }).subscribe({
      next: ({ seals, detailData, shoppingList }) => {
        if (seals && detailData) {
          this.initData(seals, detailData, shoppingList);
        }
      },
      error: () => {
        this.routerSrv.navigateToEcommerce();
      },
    });
  }

  initData(seals: ResponseListDTO<Seal>, detailData: ArticleDTO, shoppingList: ArticleDTO[]): void {
    this.shoppingList = shoppingList;
    this.detailData = this.parseArticlesSrv.setQuantityDetailArticle(shoppingList, detailData);
    this.setSeals(seals.list);
    this.setSeoData();
    this.setAnalytics();
    this.isLoading = false;
  }

  private setAnalytics(): void {
    const customEventData = {
      cf_page_title: TrackingConstants.GTM4.CF_PAGE_TITLE.ECOMMERCE_DETAIL.replace('{article}', this.detailData._id.toString()),
      page_type: TrackingConstants.GTM4.PAGE_TYPE.ECOMMERCE_DETAIL,
      language: this.langSrv.getCurrentLang(),
      country_delivery: this.countrySrv.getCurrentCountry()?.iso,
    };

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PAGE_VIEW, false, customEventData);
  }

  private setSeoData(): void {
    const articleNameDetail = `${this.multiTranslation.transform(this.detailData._m_detailTitle)}`;
    const farmName = `${this.multiTranslation.transform(this.detailData.farmer.farmName)}`;

    const params = {
      title: this.translocoService.translate('global.ecommerce-detail.metatitle', {
        farmCountry: farmName,
        articleNameDetail,
      }),
      description: this.translocoService.translate('global.ecommerce-detail.metadescription', {
        farmCountry: farmName,
        articleNameDetail,
      }),
    };

    this.setSeo(params);
  }

  setSeals(seals: Seal[]): void {
    const selectedSeals: Seal[] = this.sealsManagerSvr.getProjectSeals(seals, this.detailData.detailSeals);

    this.detailSeals = this.sealsManagerSvr.getDetailSeals(selectedSeals);
    this.farmerSeals = this.sealsManagerSvr.getFarmerSeals(selectedSeals);
    this.upSeals = [...this.sealsManagerSvr.getOfficialSeals(selectedSeals), ...this.sealsManagerSvr.getUnofficialUpSeals(selectedSeals)];
  }

  refreshBoxShoppingCart(article: ArticleDTO): void {
    this.parseArticlesSrv.setBoxShoppingList(article);
  }

  backCatalog(): void {
    this.routerSrv.navigateToEcommerce();
  }
}
