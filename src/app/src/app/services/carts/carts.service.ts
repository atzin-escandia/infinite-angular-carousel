import {Injectable, Injector} from '@angular/core';
import {Subject, Observable} from 'rxjs';

import {BaseService} from '../base';
import {CartsResource} from '../../resources';

import {StorageService} from '../storage';
import {LangService} from '../lang';
import {UnknownObjectType} from '../../interfaces';
import {ISubscriptionConfiguration} from '../../interfaces/subscription.interface';
import {EcommerceCartItem} from '@app/modules/e-commerce/interfaces/cart.interface';
import {PRODUCT_TYPE} from '@app/constants/product.constants';

@Injectable({
  providedIn: 'root'
})
export class CartsService extends BaseService {
  private counter = new Subject<number>();

  constructor(
    private cartsRsc: CartsResource,
    private storageSrv: StorageService,
    public injector: Injector,
    private langSrv: LangService
  ) {
    super(injector);
  }

  // Mandatory implementation
  public init(): void {
    const cart = this.get();

    // Set counter
    this.counter.next((cart && cart.length) || 0);
  }

  /**
   * Return counter observable
   */
  public getCounter(): Observable<number> {
    return this.counter.asObservable();
  }

  /**
   * Store cart
   */
  public store(cart: any, page?: string, fromRemove?: boolean): void {
    this.storageSrv.set('cart', cart, 86400);

    // Set counter data
    this.counter.next((cart && cart.length) || 0);

    if (cart && (cart.length > 0 || fromRemove)) {
      const params = {
        cart,
        page,
        language: this.langSrv.getCurrentLang()
      };

      void this.cartsRsc.store(params);
    }
  }

  /**
   * Get cart from storage
   */
  public get(): any {
    let cart: any;

    if (this.storageSrv.get('cart')) {
      cart = this.storageSrv.get('cart');
    } else {
      cart = null;
    }

    return cart;
  }

  /**
   * Gets cart item by array index
   *
   * @param id Should be equal to cart array index
   */
  public getByIdx(id: number): any {
    const cart = this.get() || [];

    return cart[id];
  }

  /**
   * Update cart if server store it
   */
  public update(cart: any, page?: string): void {
    this.store(cart, page, false);
  }

  /**
   * Update cart if server store it
   * call when delete an item to update the cart avoiding the 'empty no update' rule
   * existing on store()
   */
  public updateFromRemove(cart: any, page?: string): void {
    this.store(cart, page, true);
  }

  /**
   * Update product from cart
   */
  public updateByIdx(updatedProduct: any, idx: number): void {
    const cart = this.get() || [];

    cart[idx] = updatedProduct;
    this.update(cart);
  }

  /**
   * Clear cart from storage
   */
  public clear(): void {
    this.storageSrv.clear('cart');
    this.counter.next(0);
  }

  /**
   * Remove from cart
   */
  public remove(id: number): void {
    const cart = this.get() || [];

    cart.splice(id, 1);

    this.updateFromRemove(cart);
  }

  public removeItemByMasterbox(masterbox: string | string[]): void {
    let cart = this.get() || [];

    cart = cart.filter((item) =>
      Array.isArray(masterbox) ? masterbox.some((mb) => mb !== item._masterBox) : masterbox !== item._masterBox
    );

    this.updateFromRemove(cart);
  }

  /**
   * Gets necessary information
   */
  public async productsInfo(cart: any, country: string, refreshDate: boolean = false): Promise<any> {
    const productsInfo = await this.cartsRsc.productsInfo({cart, country});
    const productsInfoMap = this.mapProductsInfo(productsInfo, refreshDate, cart);

    return productsInfoMap;
  }

  public async productsInfoV2(cart: any, country: string, refreshDate: boolean = false): Promise<{
    cart: UnknownObjectType[];
    total: {
      amount: number;
      amountToPay?: number;
      creditsToSpend?: number;
    };
  }> {
    const productsInfo = await this.cartsRsc.productsInfoV2({cart, country});
    const productsInfoMap = this.mapProductsInfo(productsInfo.cart, refreshDate, cart);

    return { cart: productsInfoMap, total: productsInfo.total };
  }

  private mapProductsInfo(productsInfo: UnknownObjectType[], refreshDate: boolean, cart: UnknownObjectType[]): UnknownObjectType[] {
    productsInfo.map((product: any, i: number) => {
      if (product.type !== PRODUCT_TYPE.ECOMMERCE) {
        product.up = this.modelize(product.up);

        if (refreshDate) {
          if (product.availableDates && product.availableDates.length > 0) {
            if (product.availableDates.indexOf(cart[i].selectedDate) === -1) {
              product.selectedDate = product.availableDates[0];

              const updatedItem = this.getByIdx(i);

              updatedItem.selectedDate = product.selectedDate;
              this.updateByIdx(updatedItem, i);
            }
          }
        } else {
          product.selectedDate = cart[i].selectedDate;
        }

        let currentMasterBox: any;

        product.up.masterBoxes = product.up.masterBoxes.filter((mb: any) => mb.active);
        product.up.masterBoxes.map((mb: any, idx: number) => {
          if (mb._id === product._masterBox) {
            currentMasterBox = mb;
            product.mbSelected = idx;
          }
        });

        if (currentMasterBox) {
          product.masterBox = currentMasterBox;
        }

        if (product.masterBoxes) {
          product.masterBoxes = product.masterBoxes.filter((mb: any) => mb.active);
          product.mbOptions = [];
          product.mbValues = [];
          product.openDropdown = false;
          for (let mb = 0; mb < product.masterBoxes.length; mb++) {
            product.mbOptions.push(product.masterBoxes[mb]._m_publicName);
            product.mbValues.push(mb);
          }
        }
      }
    });

    return productsInfo;
  }

  /**
   * Refresh prices and dates
   */
  public refreshPricesAndDates(products: any, country: string): Promise<any> {
    return this.cartsRsc.refreshPricesAndDates({products: this._refreshPricesAndDatesProductsMap(products), country});
  }

  /**
   * Map products for refresh prices and dates api call
   */
  private _refreshPricesAndDatesProductsMap(products: UnknownObjectType[]): UnknownObjectType[] {
    return products.map((elem) => ({
      type: elem.type,
      _masterBox: elem._masterBox,
      multiShotBox: elem.multiShotBox,
      up: { _id: elem.up?._id },
      _upCf: elem._upCf,
      ums: elem.ums,
      numMasterBoxes: elem.numMasterBoxes,
      stepMS: elem.stepMS,
      multiShot: elem.multiShot,
      multiShotRenew: elem.multiShotRenew,
      oneShot: elem.oneShot,
      overharvest: elem.overharvest,
      oneShotRenew: elem.oneShotRenew,
    }));
  }

  /**
   * Reutrns arr of ISOs compatible on cart
   */
  public getCountriesOnCart(cart: any): any {
    const mbArr = [];

    cart.map((product: any) => {
      product.up.masterBoxes.map((mb: any) => {
        mbArr.push(mb);
      });
    });

    let availbaleISOs = [];

    mbArr.map((mb: any) => {
      // ISOs of current mb
      const mbISOs = mb.countries.map((country: any) => country.iso);

      // Filter countries that are available
      if (availbaleISOs.length === 0) {
        // New array
        availbaleISOs = mbISOs;
      } else {
        // Available = ISOs that also are in current mb ISO
        availbaleISOs = mbISOs.filter((iso: string) => availbaleISOs.indexOf(iso) !== -1);
      }
    });

    return availbaleISOs;
  }

  public addEcommerce(item: EcommerceCartItem): void {
    let cart = this.get() || [];
    const ecCartItem = cart.find((elem) => elem.type === PRODUCT_TYPE.ECOMMERCE);

    if (ecCartItem) {
      cart = cart.filter((elem) => elem.type !== PRODUCT_TYPE.ECOMMERCE);
    }

    this.counter.next(cart?.length || 0);

    cart.push(item);
    this.update(cart, 'New');
  }

  public deleteEcItem(): void {
    let cart = this.get() || [];

    if (cart?.length) {
      cart = cart.filter((elem) => elem.type !== PRODUCT_TYPE.ECOMMERCE);
    }

    this.update(cart, 'New');
  }

  /**
   * Add product to cart formatted
   *
   * @param up => Adoption | Overharvest
   * @param name
   * @param upCf => Renew | MultishotBox
   * @param masterBox Always => Adoption | Renewal | MultiShotBox | Overharvest
   * @param quantity ums => Adoption (MS) | Renew (MS) | MultiShotBox | Overharvest &&  mbLeft => MultiShotBox | Overharvest
   * @param uberUp
   * @param farmerSlug => Adoption | Overharvest
   * @param flags
   * @param selectedDate
   * @param gift
   */
  public add(
    purchaseType: string,
    up: any,
    name: string,
    upCf: any,
    masterBox: string,
    quantity: any,
    uberUp: any,
    farmerSlug: any,
    flags: any = {},
    selectedDate?: any,
    subscription?: Omit<ISubscriptionConfiguration, 'date'>,
    isSubscriptionAvailable?: boolean,
    gift: any = {},
  ): void {
    const isAdoption: boolean = purchaseType === 'adoption';
    const isRenew: boolean = purchaseType === 'renewal';
    const isMsBox: boolean = purchaseType === 'multiShotBox';
    const isOh: boolean = purchaseType === 'overharvest';
    const isOneShot: boolean = flags?.oneShot;
    const isMultiShot: boolean = flags?.multiShot;
    const isUberUp: boolean = flags?.uberUp;
    const trackingItem = this.getTrackingItem(isAdoption, isOh, up, isRenew, upCf, isMsBox, masterBox, farmerSlug, isOneShot);

    // TODO >> Trackear
    // this.trackingSrv.sendadd(item);
    const product = this.getProduct(
      masterBox, up, isAdoption, name, isMsBox, isRenew, upCf, isMultiShot, quantity, isOh, isUberUp, uberUp, selectedDate, trackingItem);

    // Add Subscription to product
      if (isSubscriptionAvailable || subscription) {
        product.subscription = {
        startDate: selectedDate,
        frequency: subscription?.frequency,
        units: subscription?.units,
        isActive: !!subscription
      };
    }

    // Add Gift to product
    gift && (product.gift = gift);

    let cart = this.get() || [];

    cart = cart.filter((item: any) => {
      if (isRenew && item._upCf === upCf._id) {
        return;
      }

      return item;
    });

    this.counter.next((cart && cart.length) || 0);

    cart.push(product);
    this.update(cart, 'New');
  }

  private getTrackingItem(
    adoption: boolean,
    oh: boolean,
    up: any,
    renew: boolean,
    upCf: any,
    msBox: boolean,
    masterBox: string,
    farmerSlug: any,
    isOneShot: boolean): any {
    return {
      // ID
      ...((adoption || oh) && {id: up._id}),
      ...(renew && {id: upCf._up}),
      ...(msBox && {id: masterBox}),

      // Name && Category
      ...((adoption || oh) && {
        name: farmerSlug + ' ' + String(up._m_slug.en),
        category: up._m_up.en
      }),
      ...((msBox || renew) && {
        name: String(upCf.farmerSlug) + ' ' + String(upCf.upSlug.en),
        category: upCf.upSlug.en
      }),

      // Type
      ...(oh && {type: 'OVERHARVEST'}),
      ...(msBox && {type: 'MULTI_SHOT_SINGLE_BOXES'}),
      ...(adoption && {type: isOneShot ? 'ONE_SHOT' : 'MULTI_SHOT_ADOPTION'}),
      ...(renew && {type: isOneShot ? 'ONE_SHOT_RENEWAL' : 'MULTI_SHOT_RENEWAL'})
    };
  }

  private getProduct(
    masterBox: string,
    up: any,
    adoption: boolean,
    name: string,
    msBox: boolean,
    renew: boolean,
    upCf: any,
    isMultiShot: boolean,
    quantity: any, oh: boolean,
    isUberUp: boolean,
    uberUp: any,
    selectedDate: any,
    trackingItem: { name: string; id: string; category: any; type: string }): any {
    return {
      // MB
      _masterBox: masterBox,

      // Up Id
      _up: up._id,

      // Name
      ...(adoption && {name}),
      ...((msBox || renew) && {name: upCf.name}),

      // UpCf
      ...((renew || msBox) && {_upCf: upCf._id}),

      // Ums
      ...(isMultiShot && (adoption || renew) && {stepMS: quantity.stepMS}),

      ...((oh || msBox) && {numMasterBoxes: quantity.numMasterBoxes}),

      // UU
      ...(isUberUp && (adoption || msBox || renew) && {_uberUp: uberUp ? uberUp._id : upCf._uberUp}),

      // MB Left
      ...((oh || msBox) && {mbLeft: quantity.mbLeft}),

      // Selected Date
      selectedDate,

      type: trackingItem.type,
      uberUp,
      toEvent: {
        itemData: trackingItem,
      },
      ...(selectedDate && {selectedDate})
    };
    }
}
