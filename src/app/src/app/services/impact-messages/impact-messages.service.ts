import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from '@services/config';
import { first, map } from 'rxjs/operators';
import { ImpactMessages } from '@app/modules/purchase/interfaces/impact-messages.interface';
import { IMPACT_MESSAGES_PAGE } from '@app/modules/purchase/constants/impact-messages.constants';
import { ImpactMessagesResource } from '@app/resources/impact-messages';
import { PRODUCT_TYPE } from '@app/constants/product.constants';

@Injectable({
  providedIn: 'root',
})
export class ImpactMessagesService {
  // Mandatory implementation
  init: any = () => null;
  allImpactMessages: ImpactMessages[] = [];

  constructor(private impactMessagesRsc: ImpactMessagesResource, public configSrv: ConfigService) {}

  getImpactMessage(page: IMPACT_MESSAGES_PAGE, products?: any[]): any {
    const impactMessagesByPage = this.allImpactMessages.filter((e) => e.page === page);
    const idProducts = this.getSealsSubcategories(products);
    const messagesWithoutSealsSubcat = this.selectEmptySealsSubcategories(impactMessagesByPage);
    const specificImpactMessages = this.setSpecificMessage(impactMessagesByPage, idProducts);
    const impactMessage = this.pickRandomImpactMessage(specificImpactMessages.length ? specificImpactMessages : messagesWithoutSealsSubcat);

    return impactMessage;
  }

  getSealsSubcategories(products: any): { idSeals: any[]; idSubcategories: any[] } {
    const idSeals = this.getProductsSealsIds(products);
    const idSubcategories = this.getProductsSubcategoriesIds(products);

    return { idSeals, idSubcategories };
  }

  matchSpecificImpactMessages(allImpactMessages: any[], idProducts: any): unknown[] {
    const matchedMessageSeals = [];
    const matchedMessageSubCategories = [];

    allImpactMessages.forEach((message) => {
      message.seals && idProducts.idSeals.forEach((idSeals) => message.seals.includes(idSeals) && matchedMessageSeals.push(message));
      message.subcategories &&
        idProducts.idSubcategories.forEach(
          (idSubcategories) => message.subcategories.includes(idSubcategories) && matchedMessageSubCategories.push(message)
        );
    });

    return [...matchedMessageSeals, ...matchedMessageSubCategories];
  }

  pickRandomImpactMessage(allImpactMessages: any): Promise<any> {
    return allImpactMessages[Math.floor(allImpactMessages.length * Math.random())];
  }

  getProductsSealsIds(products: any[]): any[] {
    return products
      .filter((elem) => elem.type !== PRODUCT_TYPE.ECOMMERCE)
      .map((product) => [...product.farmer.seals, ...product.up.seals, ...product.farm.seals])
      .flat()
      .map((e) => e._seal)
      .filter((e, i, arr) => arr.indexOf(e) === i);
  }

  getProductsSubcategoriesIds(products: any[]): any[] {
    return products
      .filter((elem) => elem.type !== PRODUCT_TYPE.ECOMMERCE)
      .map((product) => product.products[0].subcategory)
      .filter((item, i, arr) => arr.indexOf(item) === i);
  }

  getImActiveParams(): Observable<any> {
    return this.configSrv.getValue('imActiveParams').pipe(
      map((config) => {
        try {
          return JSON.parse(config._value);
        } catch (err) {
          return {
            isImActive: false,
            isImBasketActive: false,
            isImCheckoutLoaderActive: false,
            isImConfirmationPageActive: false,
          };
        }
      })
    );
  }

  setSpecificMessage(impactMessagesByPage: any[], idProducts: any): unknown[] {
    return this.matchSpecificImpactMessages(impactMessagesByPage, idProducts).filter((e, i, arr) => arr.indexOf(e) === i);
  }

  selectEmptySealsSubcategories(allImpactMessages: any[]): unknown[] {
    return allImpactMessages.filter((message) => !message.seals?.length && !message.subcategories?.length);
  }

  isImActive(page: string): Observable<any> {
    return this.getImActiveParams().pipe(first((res) => typeof res === 'object' && res.isImActive && res[`isIm${page}Active`]));
  }

  async initImpactMessages(): Promise<void> {
    try {
      const allImpactMessages: any = await this.impactMessagesRsc.getAllImpactMessages();

      this.allImpactMessages = allImpactMessages?.list;
    } catch (err) {
      return;
    }
  }
}
