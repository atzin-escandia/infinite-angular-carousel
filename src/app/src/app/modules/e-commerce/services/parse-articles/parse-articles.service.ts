import { Injectable } from '@angular/core';
import { ResponseListDTO } from '@app/interfaces/response-dto.interface';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { EC_CART_LIST, RESTRICTION_MAX_WEIGHT_MODAL, SHOPPING_CART_LIST } from '../../constant/states.constant';
import { ArticleDTO } from '../../interfaces';
import { MAX_WEIGHT_BOX } from '../../constant/restrictions.constant';
import { GenericPopupComponent } from '@app/popups/generic-popup';
import { translate } from '@ngneat/transloco';
import { PopupService } from '@app/services/popup';
import { CartsService, StorageService } from '@app/services';
import dayjs from 'dayjs';

@Injectable({
  providedIn: 'root',
})
export class ParseArticlesService {
  private obsBoxShoppingList: BehaviorSubject<ArticleDTO[]> = new BehaviorSubject<ArticleDTO[]>([]);
  getBoxShoppingList$: Observable<ArticleDTO[]> = this.obsBoxShoppingList.asObservable();

  isInitialShopping = true;

  constructor(public storage: StorageService, public popupSrv: PopupService, private cartsSrv: CartsService) {}

  /**
   * refreshBoxShoppingList
   */
  refreshBoxShoppingList(articles: ArticleDTO[]): void {
    this.obsBoxShoppingList.next(articles);
  }

  clearBoxShoppingList(): void {
    this.isInitialShopping = true;
    this.storage.clear(SHOPPING_CART_LIST);
    this.clearListCart();
    this.obsBoxShoppingList.next([]);
  }

  clearListCart(): void {
    this.storage.clear(EC_CART_LIST);

    this.cartsSrv.deleteEcItem();
  }

  getArticles(): Observable<void | ArticleDTO[]> {
    return this.getBoxShoppingList$.pipe(
      map((articles: ArticleDTO[]) => (!articles?.length && this.isInitialShopping ? this.getStorageData() : articles))
    );
  }

  /**
   * getStorageData
   * Retrieve data from the shopping cart or storage, giving priority to the shopping cart
   *
   * @param shopingList
   * @param catalogArticles
   * @returns
   */

  getStorageData(): ArticleDTO[] {
    const articles: ArticleDTO[] = this.storage.get(EC_CART_LIST)?.length
      ? this.storage.get(EC_CART_LIST)
      : this.storage.get(SHOPPING_CART_LIST) || [];

    if (articles?.length) {
      this.storage.set(SHOPPING_CART_LIST, articles);

      this.refreshBoxShoppingList(articles);
    }

    return articles;
  }

  setAvailableArticles(data: ResponseListDTO<ArticleDTO>): ResponseListDTO<ArticleDTO> {
    return {
      ...data,
      list: data.list.map((item: ArticleDTO) => ({
        ...item,
        isUnavailable: item.status === 2,
      })),
    };
  }

  calculateTotalPrice(items: ArticleDTO[]): number {
    return (
      items?.reduce(
        (acc, current) => acc + current.totalPrice * (!current.isUnavailable && !current.isNotSharedDate ? current?.quantity || 0 : 0),
        0
      ) || 0
    );
  }

  sortDates(arrayDates: string[]): string[] {
    return arrayDates.sort((a, b) => (dayjs(a).isBefore(dayjs(b)) ? 1 : -1));
  }

  filterItemsList(items: ArticleDTO[]): ArticleDTO[] {
    return items.filter((item) => item.quantity > 0);
  }

  setQuantityArticles(articlesList: ArticleDTO[], boxShoppingList: ArticleDTO[]): ArticleDTO[] {
    if (boxShoppingList?.length) {
      boxShoppingList.forEach((boxArticle: ArticleDTO) => {
        const articleInd = articlesList.findIndex((art: ArticleDTO) => art.articleId === boxArticle.articleId);

        if (articleInd !== -1) {
          articlesList[articleInd].quantity = boxArticle.quantity;
        }
      });
    }

    return articlesList;
  }

  setQuantityDetailArticle(articlesList: ArticleDTO[], detailData: ArticleDTO): ArticleDTO {
    const article = articlesList.find((art: ArticleDTO) => art.articleId === detailData.articleId);

    detailData.quantity = article ? article.quantity : 0;

    return detailData;
  }

  setBoxShoppingList(article: ArticleDTO): void {
    this.isInitialShopping = false;
    const shoppingCartList: ArticleDTO[] = this.storage.get(SHOPPING_CART_LIST) || [];

    const itemIndex = shoppingCartList?.findIndex((item) => item._id === article._id);

    if (itemIndex !== -1) {
      if (article.quantity) {
        shoppingCartList[itemIndex].quantity = article.quantity;
      } else {
        shoppingCartList.splice(itemIndex, 1);
      }
    } else {
      shoppingCartList.push({ ...article });
    }
    this.storage.set(SHOPPING_CART_LIST, shoppingCartList);

    this.refreshBoxShoppingList(shoppingCartList);
  }

  checkMaxWeighShoppingList(article: ArticleDTO): boolean {
    const initialValue = 0;
    let weight = initialValue;

    const shoppingCartList: ArticleDTO[] = this.storage.get(SHOPPING_CART_LIST) || [];

    if (article.weightInKilos) {
      weight = shoppingCartList.reduce(
        (acc: number, currentValue: ArticleDTO) => acc + currentValue.weightInKilos * currentValue.quantity,
        initialValue
      );
      weight = weight + article.weightInKilos;
    }

    return weight < MAX_WEIGHT_BOX;
  }

  getShoppingCart(): ArticleDTO[] {
    return this.storage.get(SHOPPING_CART_LIST);
  }

  displayGenericPopUp(id: string, msg: string = 'Operation not available', btnText?: string): any {
    return this.popupSrv.open(GenericPopupComponent, { data: { id, msg: translate(msg), btnText: btnText ? translate(btnText) : null } });
  }

  showMaxWeightRestriction(): void {
    this.displayGenericPopUp(RESTRICTION_MAX_WEIGHT_MODAL, 'notifications.maximum-weight-box.body', 'global.understood.button');
  }

  parseDetailRoute(path: string): string {
    const re = / /gi;

    return path.toLowerCase().replace(re, '-');
  }
}
