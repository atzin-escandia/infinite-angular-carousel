import { Injectable, Injector } from '@angular/core';

import { BaseService } from '../base';
import { ProductsResource } from '@resources/products/products.resource';
import { Product } from '@interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseService {
  constructor(public injector: Injector, private productRsc: ProductsResource) {
    super(injector);
  }

  /**
   * Get product by id from server
   */
  public async getById(id: string): Promise<Product> {
    return await this.productRsc.getById(id);
  }

  /**
   * Returns the correct textID for each type
   *
   * @param product Cart Item
   */
  public productTypeText(product: any): string {
    let typeText: string;

    this.productType(product);

    if (product.multiShot) {
      typeText = 'Adoption';
    } else if (product.multiShotRenew) {
      typeText = 'Renewal';
    } else if (product.oneShot) {
      typeText = 'Adoption plus shipment';
    } else if (product.oneShotRenew) {
      typeText = 'Renewal plus shipment';
    } else if (product.multiShotBox || product.overharvest) {
      typeText = 'Box/es of';
    }

    return typeText;
  }

  /**
   * Returns product with type as true
   */
  public productType(product: any): void {
    switch (product.type?.toUpperCase() || product.orderType?.toUpperCase()) {
      case 'ONE_SHOT':
        product.oneShot = true;
        break;
      case 'ONE_SHOT_RENEWAL':
        product.oneShotRenew = true;
        break;
      case 'MULTI_SHOT_ADOPTION':
        product.multiShot = true;
        break;
      case 'MULTI_SHOT_RENEWAL':
        product.multiShotRenew = true;
        break;
      case 'MULTI_SHOT_SINGLE_BOXES':
        product.multiShotBox = true;
        break;
      case 'OVERHARVEST':
        product.overharvest = true;
        break;
    }

    if (product.uberUp) {
      product.isUberUp = true;
    }
  }

  /**
   * Checks and change cartProduct ums value
   */
  public changeQuantity(cart: any, step: number, cartProduct: any, id: number): any {
    // Adoption
    if (cartProduct.multiShot || cartProduct.multiShotRenew) {
      const minBoxes: number = cartProduct.up.minStepMS;
      const maxBoxes: number = cartProduct.up.maxStepMS;
      let totalBoxes: number = cartProduct.stepMS;

      if (totalBoxes === minBoxes && step === -1) {
        // Can't be less
        return;
      } else if (totalBoxes === maxBoxes && step === 1) {
        // Can`t add more
        return;
      } else {
        if (step === 1) {
          totalBoxes++;
        } else if (step === -1) {
          totalBoxes--;
        }
      }

      cart[id].stepMS = totalBoxes;

      // Boxes
    } else {
      let totalInCart = 0;

      cart.map((item: any) => {
        if (item._upCf === cartProduct._upCf) {
          totalInCart += item.numMasterBoxes;
        }
      });

      if (totalInCart >= cartProduct.mbLeft && step === 1) {
        return;
      }

      if (cartProduct.numMasterBoxes <= 1 && step === -1) {
        return;
      }

      let currentBoxes = cartProduct.numMasterBoxes + step;

      if (currentBoxes >= cartProduct.mbLeft) {
        currentBoxes = cartProduct.mbLeft;
      }

      cart[id].numMasterBoxes = currentBoxes;
    }

    return cart[id];
  }

  /**
   * Checks cart dates
   */
  public checkAvailableDates(products: any): boolean {
    let hasAllDatesValid = true;

    if (products?.length > 0) {
      products.map((product: any) => {
        if ((product.oneShotRenew || product.multiShotRenew) && product.season.renewalChangedForward) {
          product.datesNoAvailable = false;
        } else if (product.oneShot || product.oneShotRenew || product.overharvest || product.multiShotBox) {
          if (!product.selectedDate && !product.season.checkAvailableDates) {
            hasAllDatesValid = false;
            product.datesNoAvailable = true;
          } else {
            product.datesNoAvailable = false;
          }
        }
      });
    }

    return hasAllDatesValid;
  }
}
