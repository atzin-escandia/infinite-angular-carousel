import { Injectable, Injector } from '@angular/core';
import { BaseService } from '../base';
import { PurchaseResource } from '../../resources';

@Injectable({
  providedIn: 'root',
})
export class PurchaseService extends BaseService {
  constructor(public injector: Injector, private purchaseRsc: PurchaseResource) {
    super(injector);
  }

  /**
   * Correct format for cart
   */
  public formatCart(cart: any): any {
    cart.map((product: any) => {
      for (const key in product) {
        if (product[key]) {
          if (key.startsWith('_')) {
            product[key.substr(1)] = product[key];
            delete product[key];
          }
          if (product.type === 'MULTI_SHOT_ADOPTION' || product.type === 'MULTI_SHOT_RENEWAL') {
            delete product.masterBox;
          }
          delete product.toEvent;

          if (product.uberUp && (product.type === 'ONE_SHOT_RENEWAL' || product.type === 'MULTI_SHOT_RENEWAL')) {
            delete product.uberUp;
          }
        }
      }
    });

    return cart;
  }

  /**
   * Validate cart
   */
  public async validateCart(cart: any, country: string): Promise<{ isValidCart: boolean; validError: string }> {
    let isValidCart: boolean;
    let validError: string;

    try {
      isValidCart = await this.validate(cart, country);
    } catch (err) {
      validError = err.msg;
      isValidCart = false;
    }

    return { isValidCart, validError };
  }

  /**
   * Validate cart against server
   */
  public async validate(cart: any, country: string): Promise<any> {
    return await this.purchaseRsc.validate({ cart, country });
  }

  /**
   * Validate cart against server
   */
  public async validateAuth(amount: number, deviceId: string, addressId: string): Promise<any> {
    return await this.purchaseRsc.validateAuth({ amount, addressId, deviceId });
  }

  public async order(body: any): Promise<any> {
    return await this.purchaseRsc.order(body);
  }
}
