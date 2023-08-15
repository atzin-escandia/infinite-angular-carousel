import { Injectable } from '@angular/core';
import { ArticleDTO } from '../../interfaces';
import dayjs from 'dayjs';
import { SharedCountData, SharedDate } from './interfaces/shared-date.interface';

@Injectable({
  providedIn: 'root',
})
export class DatesManagerService {
  /**
   * calculateDeliveryDate
   * Calculate the smallest most repeated date among all the items selected in the basket
   *
   * @param items
   * @returns string
   */
  calculateDeliveryDate(items: ArticleDTO[]): { endDeliveryDate: string; items: ArticleDTO[] } {
    const result: SharedDate = {};

    // Find mininal shared dates
    const {dateShared, countDatesShared} = this.findMinimumShareDateItems(items);

    result.sharedSendDate = dateShared;

    // Check if all dates repeat the same times
    if (countDatesShared.some((itemShared) => itemShared.value !== countDatesShared[0].value)) {
      // Find objects that have no shared dates
      const outlierObjects = items.filter((obj: ArticleDTO) => !obj.dates.some((date) => date === result.sharedSendDate));

      if (outlierObjects?.length > 0) {
        result.articlesWithisNotSharedDates = outlierObjects.map((obj: ArticleDTO) => obj.articleId) || null;
      }

      // Select nor shared articles
      this.selectNotSharedArticles(items, result.articlesWithisNotSharedDates);
      // Get the shortest delivery date that coincides with the shipment date.
      result.sharedDeliveryDate = this.getDeliveryDate(items, result.sharedSendDate);
    } else {
      // Update list storing the items that are not allowed to be included in the box
      this.checkIsNotSharedArticles(items, result);
    }

    items = this.orderSharedArticles(items);

    return { endDeliveryDate: result.sharedDeliveryDate, items };
  }

  findMinimumShareDateItems(items: ArticleDTO[], field: string = 'dates'): SharedCountData {
    // Create a flat array of all availableDates with duplicates
    const allDatesDuplicates = items.flatMap((obj: { dates: string[] }) => obj[field]);

    // Count, filter and sort by number of occurrences all dates repeated at least 2 times
    const countDates = {};

    allDatesDuplicates.forEach((date: string) => (countDates[date] = (countDates[date] || 0) + 1));

    const countDatesShared = Object.keys(countDates)
      .map((key) => ({ key, value: countDates[key] }))
      .sort((a, b) => b.value - a.value || (dayjs(b.key).isAfter(dayjs(a.key)) ? 1 : 0));

    return { dateShared: countDatesShared?.length ? countDatesShared[0]?.key : null, countDatesShared };
  }

  /**
   * getDeliveryDate
   * Get the shortest delivery date that coincides with the shipment date.
   *
   * @param items
   * @param sharedSendDate
   * @returns
   */
  getDeliveryDate(items: ArticleDTO[], sharedSendDate: string): string {
    const sharedItems: ArticleDTO[] = items.filter((item: ArticleDTO) => item.dates.includes(sharedSendDate));

    // Find mininal shared dates
    const {dateShared} = this.findMinimumShareDateItems(sharedItems, 'deliveryDates');

    return dateShared;
  }

  /**
   * selectNotSharedArticles
   * Select the items that do not share a delivery date
   *
   * @param items
   * @param articlesWithisNotSharedDates
   */
  selectNotSharedArticles(items: ArticleDTO[], articlesWithisNotSharedDates: string[]): void {
    items.forEach((article: ArticleDTO) => {
      article.isNotSharedDate = false;

      if (articlesWithisNotSharedDates && articlesWithisNotSharedDates.includes(article.articleId)) {
        article.isNotSharedDate = true;
      }
    });
  }

  /**
   * checkIsNotSharedArticles
   *
   * Check and update the list of elements that cannot be included in the box with the following conditions.
   * - When you have included many items in the basket, dates are searched for matches among all,
   * and all the items that match the minimum delivery date are included in the box.
   * - When you have included many items and no date coincides, the one with the largest quantity of the same item will be chosen,
   * when the quantity is the same, it will include the one with the highest price.
   *
   * @param items
   * @param articlesWithisNotSharedDates
   */
  checkIsNotSharedArticles(
    items: ArticleDTO[],
    result: { sharedSendDate?: string; sharedDeliveryDate?: string; articlesWithisNotSharedDates?: string[] }
  ): void {
    let itemsCopy: ArticleDTO[] = [...items];

    itemsCopy = itemsCopy.sort((a, b) => b.quantity - a.quantity || b.totalPrice - a.totalPrice);

    // Order first element dates and deliveryDates
    itemsCopy[0].dates = itemsCopy[0].dates.sort((a, b) => (dayjs(b).isAfter(dayjs(a)) ? 1 : 0));
    itemsCopy[0].deliveryDates = itemsCopy[0].deliveryDates.sort((a, b) => (dayjs(b).isAfter(dayjs(a)) ? 1 : 0));

    // Check dates with minimal date
    items.forEach((article: ArticleDTO) => {
      article.isNotSharedDate = !article.dates.includes(itemsCopy[0].dates[0]);
    });
    result.sharedSendDate = itemsCopy[0].dates[0];
    result.sharedDeliveryDate = itemsCopy[0].deliveryDates[0];
  }

  /**
   * orderSharedArticles
   * Order at the end of the list the items that do not share a shipping date with the rest
   *
   * @param items
   */
  orderSharedArticles(items: ArticleDTO[]): ArticleDTO[] {
    const sharedArticles = items.filter((item) => !item.isNotSharedDate);
    const notSharedArticles = items.filter((item) => item.isNotSharedDate);

    return [...sharedArticles, ...notSharedArticles];
  }
}
