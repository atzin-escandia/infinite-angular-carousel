import { AfterViewInit, Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { CartsService, DomService, RouterService, StorageService, TrackingConstants, TrackingService, UtilsService } from '@app/services';
import { ArticleDTO, RestrictionDTO } from '../../interfaces';
import { EcommerceBasePage } from '../../resources/ecommerce-base/ecommerce-base.page';
import { ParseArticlesService } from '../../services/parse-articles/parse-articles.service';
import { DEFAULT_RESTRICTIONS } from './constant/min-limits.constant';
import { OperatorsName } from '../../interfaces/operators-name.interface';
import { EC_CART_LIST } from '../../constant/states.constant';
import { DatesManagerService } from '../../services/dates-manager/dates-manager.service';

@Component({
  selector: 'ec-drawer-modal-wrapper',
  templateUrl: './ec-drawer-modal-wrapper.component.html',
  styleUrls: ['./ec-drawer-modal-wrapper.component.scss'],
})
export class EcDrawerModalWrapperComponent extends EcommerceBasePage implements AfterViewInit {
  isOpened = false;
  boxShoppingList: ArticleDTO[] = [];

  @Input() set items(newValue: ArticleDTO[]) {
    this.boxShoppingList = newValue;
  }

  @Input() restrictions: RestrictionDTO = DEFAULT_RESTRICTIONS;

  @Input() set open(newValue: boolean) {
    this.isOpened = newValue;

    if (this.isOpened) {
      this.calculateTotalPrice();
    }
  }

  @Output() closeDrawer = new EventEmitter<boolean>();

  endDeliveryDate: string;

  /**
   * Total price
   */
  totalPrice = 0;

  /**
   * Check the minimum items for purchase
   */
  areMinElements: boolean;

  minPrice = 0;
  minElements = 0;

  constructor(
    public injector: Injector,
    public trackingSrv: TrackingService,
    public utilsSrv: UtilsService,
    private storageSrv: StorageService,
    private parseArticlesSrv: ParseArticlesService,
    private datesManagerSrv: DatesManagerService,
    private cartSrv: CartsService,
    private routerSrv: RouterService,
    private domSrv: DomService
  ) {
    super(injector);
  }

  ngAfterViewInit(): void {
    const customEventData = {
      cf_page_title: TrackingConstants.GTM4.CF_PAGE_TITLE.ECOMMERCE_BASKET,
      page_type: TrackingConstants.GTM4.PAGE_TYPE.ECOMMERCE_BASKET,
      language: this.langSrv.getCurrentLang(),
      country_delivery: this.countrySrv.getCurrentCountry()?.iso,
    };

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PAGE_VIEW, false, customEventData);
  }

  /**
   * Calculate Total price
   */
  calculateTotalPrice(): void {
    if (this.boxShoppingList?.length) {
      const { endDeliveryDate, items } = this.datesManagerSrv.calculateDeliveryDate(this.boxShoppingList);

      this.endDeliveryDate = endDeliveryDate;
      this.boxShoppingList = items;
    }

    this.totalPrice = this.parseArticlesSrv.calculateTotalPrice(this.boxShoppingList);

    this.setMinElements();
  }

  /**
   * Set the minimum conditions to buy
   */
  setMinElements(): void {
    const activeItems: ArticleDTO[] = this.boxShoppingList.filter((item) => !item.isUnavailable && !item.isNotSharedDate);
    const articleUnitsLength: number = activeItems.reduce((acc, currenValue: ArticleDTO) => acc + currenValue.quantity, 0);

    this.minElements =
      this.restrictions.minimumArticles - articleUnitsLength > 0 ? this.restrictions.minimumArticles - articleUnitsLength : 0;
    this.minPrice = this.restrictions.minimumPVP - this.totalPrice >= 0 ? this.restrictions.minimumPVP - this.totalPrice : 0;
    this.areMinElements = articleUnitsLength >= this.restrictions.minimumArticles && this.totalPrice >= this.restrictions.minimumPVP;
  }

  checkMinPriceElementConditions(elements: number, operator: OperatorsName): boolean {
    const conditions = {
      equal: this.boxShoppingList?.length && !this.areMinElements && this.minElements === elements && this.minPrice !== 0,
      greater: this.boxShoppingList?.length && !this.areMinElements && this.minElements > elements && this.minPrice !== 0,
    };

    return conditions[operator];
  }

  checkMinOnlyElementsCondition(): boolean {
    return this.boxShoppingList?.length && !this.areMinElements && this.minElements > 0 && this.minPrice === 0;
  }

  /**
   * changeArticle
   *
   * @param list
   */
  changeArticle(article: ArticleDTO): void {
    this.parseArticlesSrv.setBoxShoppingList(article);
    this.boxShoppingList = this.parseArticlesSrv.getShoppingCart();
    this.calculateTotalPrice();
  }

  /**
   * selectArticle
   *
   * When an item is selected the side modal should be closed
   */
  selectArticle(): void {
    this.closeDrawer.emit(this.isOpened);
  }

  /**
   * Send cart to buy
   */
  buy(): void {
    this.calculateTotalPrice();
    const cartArticlesStorage = this.boxShoppingList.filter((item) => !item.isUnavailable && !item.isNotSharedDate);

    if (cartArticlesStorage.length > 0) {
      const cartItem = {
        type: 'ECOMMERCE',
        articles: cartArticlesStorage.map((item) => ({ id: item.articleId, quantity: item.quantity })),
      };

      this.storageSrv.set(EC_CART_LIST, cartArticlesStorage);
      this.cartSrv.addEcommerce(cartItem);

      this.closeDrawer.emit(this.isOpened);

      // TEMP FIX: Drawer scroll ----------
      const body = this.domSrv.document.querySelector('body');

      body.style.removeProperty('height');
      body.style.removeProperty('overflow-y');
      // TEMP FIX: Drawer scroll ----------

      this.routerSrv.navigateToOrderSection('cart');
    }
  }

  /**
   * Delete items
   */
  deleteList(): void {
    this.parseArticlesSrv.clearBoxShoppingList();
    this.calculateTotalPrice();
  }
}
