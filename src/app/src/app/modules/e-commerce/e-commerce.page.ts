import { ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { RouterService } from '@app/services';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { E_COMMERCE_ROUTES } from './constant/routes.constant';
import { ArticleDTO, RestrictionDTO } from './interfaces';
import { EcommerceBasePage } from './resources/ecommerce-base/ecommerce-base.page';
import { ECommerceService } from './services';
import { ParseArticlesService } from './services/parse-articles/parse-articles.service';
import { DatesManagerService } from './services/dates-manager/dates-manager.service';

@Component({
  selector: 'e-commerce',
  templateUrl: './e-commerce.page.html',
  styleUrls: ['./e-commerce.page.scss'],
})
export class ECommerceComponent extends EcommerceBasePage implements OnInit, OnDestroy {
  /**
   * detect routes changes
   */
  availableEcommerce: Subscription;
  isAvailable: boolean;

  routes = E_COMMERCE_ROUTES;

  isOpenModal = false;

  restrictions: RestrictionDTO;

  /**
   * button options
   * ** temporary values
   */
  shoppingListSubs: Subscription;
  totalPrice = 0;
  shoppingList: ArticleDTO[] = [];
  articlesBadge = 0;
  btnIcon = '@app/../assets/icon/common/box.svg';

  constructor(
    public injector: Injector,
    private parserArticlesSrv: ParseArticlesService,
    private ecommerceSrv: ECommerceService,
    private routerSrv: RouterService,
    private datesManagerSrv: DatesManagerService,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.getEcommerceAvailability();
    this.getShoppingList();
  }

  ngOnDestroy(): void {
    this.availableEcommerce.unsubscribe();
  }

  getEcommerceAvailability(): void {
    this.availableEcommerce = this.ecommerceSrv.isEcommerceAvailable().subscribe({
      next: (available) => {
        this.isAvailable = !!available;

        if (available === false) {
          this.goToUnavailable();
        } else if (available) {
          this.getRestrictions();
        }
      },
    });
  }

  getRestrictions(): void {
    this.ecommerceSrv
      .getRestrictionByCountry()
      .pipe(first())
      .subscribe({
        next: (res) => (this.restrictions = { ...res }),
      });
  }

  goToUnavailable(): void {
    // force another run cycle
    setTimeout(() => {
      this.routerSrv.navigate(this.routes.UNAVAILABLE);
    }, 0);
  }

  onClickButton(value: boolean): void {
    this.isOpenModal = value;
  }

  getShoppingList(): void {
    this.shoppingListSubs = this.parserArticlesSrv.getArticles().subscribe({
      next: (articles: ArticleDTO[]) => {
        if (articles) {
          this.shoppingList = JSON.parse(JSON.stringify(articles));

          if (this.shoppingList?.length) {
            this.datesManagerSrv.calculateDeliveryDate(this.shoppingList);
          }

          this.articlesBadge = this.shoppingList.length
            ? this.shoppingList.reduce(
                (accumulator, currentValue) =>
                  accumulator + (!currentValue.isUnavailable && !currentValue.isNotSharedDate ? currentValue.quantity : 0),
                0
              )
            : 0;

          this.totalPrice = this.parserArticlesSrv.calculateTotalPrice(this.shoppingList);
          this.cdr.detectChanges();
        }
      },
    });
  }
}
