import { Injectable } from '@angular/core';
import { ICrossSellingSpecifications, UnknownObjectType } from '../../../../interfaces';
import {
  CartsService,
  CountryService,
  EventService,
  LoaderService,
  LoggerService,
  PurchaseService,
  StorageService,
  TextService,
  UserService
} from '../../../../services';
import { CheckoutStoreService } from '../store/checkout-store.service';
import { MaxBoxesPerAdoption } from '../../interfaces/checkout.interface';
import { CheckoutCommonService } from '../common/common.service';
import { PopupService } from '@app/services/popup';
import { PRODUCT_TYPE } from '@app/constants/product.constants';
import { IProductsInfoTotal } from '../../interfaces/product.interface';

@Injectable()
export class CheckoutProductsService extends CheckoutCommonService {
  constructor(
    public loaderSrv: LoaderService,
    public eventSrv: EventService,
    public userService: UserService,
    public purchaseSrv: PurchaseService,
    public cartsSrv: CartsService,
    public popupSrv: PopupService,
    public textSrv: TextService,
    public loggerSrv: LoggerService,
    public storageSrv: StorageService,
    public checkoutStoreSrv: CheckoutStoreService,
    private cartSrv: CartsService,
    private countrySrv: CountryService,
  ) {
    super(loaderSrv, eventSrv, userService, purchaseSrv, cartsSrv, popupSrv, textSrv, loggerSrv, storageSrv, checkoutStoreSrv);
  }

  async init(): Promise<void> {
    let products: UnknownObjectType[] = [];
    const getProductsRes = await this.getProducts();
    const total = getProductsRes.total;
    const cart = getProductsRes.cart;

    cart?.length && this.setPriceStuff(total);
    products = this.checkMap(cart);

    this.checkoutStoreSrv.setProducts(products);
  }

  getProducts(refreshDate: boolean = false): Promise<{
    cart: UnknownObjectType[];
    total: {
      amount: number;
      amountToPay?: number;
      creditsToSpend?: number;
    };
  }> {
    return this.cartSrv.productsInfoV2(this.cartSrv.get() || [], this.countrySrv.getCountry(), refreshDate);
  }

  checkMap(cart: UnknownObjectType[] = this.checkoutStoreSrv.products): UnknownObjectType[] {
    if (cart.length) {
      const products = this.mapProducts(cart);

      this.initMaxBoxesPerAdoption(products);
      this.checkProductsSubscription(products);

      return products;
    }

    return [];
  }

  async updatePriceAndProducts(): Promise<void> {
    const { cart, total } = await this.getProducts();

    this.setPriceStuff(total);

    const products = this.checkMap(cart);

    this.checkoutStoreSrv.setProducts(products);
  }

  async updatePrice(): Promise<void> {
    const { total } = await this.getProducts();

    this.setPriceStuff(total);
  }

  filterProductMbs(product: UnknownObjectType): UnknownObjectType[] {
    return product.masterBoxes.filter((mb: any) => mb.active && (product.overharvest ? mb.ohActive : mb.adoptionActive));
  }

  getCrossSellingSpecifications(): ICrossSellingSpecifications {
    return {
      crossSellingSB: {
        header: 'boxes to be planned',
        trackingListName: 'csCart SB',
        trackingGA4ListName: 'CS_Cart/Single_boxes',
      },
      ohProjects: {
        header: 'http://page.youmight-also-like.body',
        trackingListName: 'csCart OH',
        trackingGA4ListName: 'CS_Cart/You_might_also_like',
      },
      adoptionProjects: {
        header: 'global.available-adoption.title',
        trackingListName: 'csCart Adoptions',
        trackingGA4ListName: 'CS_Cart/Available_adoptions',
      },
      trackingActionName: 'csCart'
    };
  }

  checkProductsSubscription(products: UnknownObjectType[] = this.checkoutStoreSrv.products): void {
    const isAnyProductSubscriptionActive = products.some((_, index) => this.cartSrv.getByIdx(index)?.subscription?.isActive);

    this.checkoutStoreSrv.setIsAnyProductSubscriptionActive(isAnyProductSubscriptionActive);

    this.checkoutStoreSrv.setAllowedPaymentMethods({
      ...this.checkoutStoreSrv.allowedPaymentMethods,
      klarna: !isAnyProductSubscriptionActive
    });
  }

  purchaseErrorProductsHandler(productsUps: string[]): void {
    const productsMap = this.checkoutStoreSrv.products.map((elem) => ({
      ...elem,
      ...(productsUps.includes(elem._up) && { cantSend: true }),
    }));

    this.checkoutStoreSrv.setProducts(productsMap);

    this.checkoutStoreSrv.setHasUnavailableProducts(!!productsUps?.length);
  }

  checkPurchaseErrorProducts(productUp: string): void {
    const { products, purchaseErrorItems } = this.checkoutStoreSrv;

    if (products.find((elem) => purchaseErrorItems.includes(elem._up))) {
      this.purchaseErrorProductsHandler(purchaseErrorItems);
    } else {
      this.checkoutStoreSrv.setPurchaseErrorItems(purchaseErrorItems.filter((elem) => elem !== productUp));
    }
  }

  checkProductsAvailability(products: UnknownObjectType[]): boolean {
    return products.some((elem) => this.isProductCantSend(elem) || this.isProductDatesNoAvailable(elem));
  }

  productsCheckMap(products: UnknownObjectType[]): any[] {
    const productTypesNotNeedSelectedDate = ['MULTI_SHOT_ADOPTION', 'MULTI_SHOT_RENEWAL'];

    const parsedProducts = products.map((elem) => {
      if (
        !productTypesNotNeedSelectedDate.includes(elem.type) &&
        elem.availableDates &&
        elem.availableDates.length > 0 &&
        !elem.selectedDate
      ) {
        return { ...elem, selectedDate: elem.type === 'ECOMMERCE' ? elem.deliveryDate : elem.availableDates[0] };
      } else {
        return elem;
      }
    });

    return parsedProducts.map((elem) => ({
      ...elem,
      cantSend: this.isProductCantSend(elem),
      datesNoAvailable: this.isProductDatesNoAvailable(elem),
    }));
  }

  async validateCartProducts(iso: string): Promise<{ isValidCart: boolean; validError: string }> {
    const cart: any = this.purchaseSrv.formatCart(this.cartSrv.get());
    const { isValidCart, validError } = await this.purchaseSrv.validateCart(cart, iso);

    return { isValidCart, validError };
  }

  async refreshPricesAndDates(): Promise<UnknownObjectType[]> {
    const { cart, total } = await this.getProducts();

    this.setPriceStuff(total);

    return cart.map((product: any, i: number) => {
      if (product.availableDates) {
        if (product.availableDates.indexOf(product.selectedDate) === -1) {
          const updatedItem = this.cartSrv.getByIdx(i);

          product.selectedDate = product.availableDates[0];
          updatedItem.selectedDate = product.selectedDate;

          this.cartSrv.updateByIdx(updatedItem, i);
        }
      }

      return product;
    });
  }

  modifyBoxesPerAdoption({
    quantity,
    masterBox,
    upCf,
  }: Pick<MaxBoxesPerAdoption, 'masterBox' | 'upCf'> & { quantity: number }): void {
    const existAdoption = (item: MaxBoxesPerAdoption): boolean =>
      upCf ? item.masterBox === masterBox && item.upCf === upCf : item.masterBox === masterBox && !item.upCf;

    const adoption = this.checkoutStoreSrv.maxBoxesPerAdoptions.find(existAdoption);

    if (adoption) {
      const adoptionsUpdated = this.checkoutStoreSrv.maxBoxesPerAdoptions.map((item) => ({
        ...item,
        ...(existAdoption(item) && {
          totalBoxes: item.totalBoxes + quantity,
        }),
      }));

      this.checkoutStoreSrv.setMaxBoxesPerAdoptions(adoptionsUpdated);
    }
  }

  setProductsInfoTotalData(total: IProductsInfoTotal, isGroupOrder: boolean = this.checkoutStoreSrv.isGroupOrder): void {
    const { credits } = this.checkoutStoreSrv;
    const { amount, amountToPay, creditsToSpend} = total;

    this.checkoutStoreSrv.setPrice(amount);
    this.checkoutStoreSrv.setFinalPrice(isGroupOrder ? amount : amountToPay ?? amount);
    this.checkoutStoreSrv.setCreditsToSpend(creditsToSpend ?? credits);
    this.checkoutStoreSrv.setShowCreditsTooltip(isGroupOrder ? false : creditsToSpend && creditsToSpend !== credits && amountToPay > 0);
    this.checkoutStoreSrv.setProductsInfoTotal(total);
  }

  private setPriceStuff(total: IProductsInfoTotal): void {
    this.checkoutStoreSrv.setProductsInfoTotal(total);
    this.setProductsInfoTotalData(total);
  }

  private mapProducts(products: UnknownObjectType[]): UnknownObjectType[] {
    const productsMap = this.productsCheckMap(products);

    for (const product of productsMap) {
      product.filteredMbs = this.getProductFilteredMbs(product);

      if (product.availableDates?.length && !product.selectedDate) {
        product.selectedDate = product.availableDates[0];
      }
    }

    return productsMap;
  }

  private getProductFilteredMbs(product: UnknownObjectType): UnknownObjectType[] {
    if (product?.masterBoxes?.length) {
      const filteredMbs = this.filterProductMbs(product);

      if (filteredMbs.length) {
        for (const mb of filteredMbs) {
          mb.firstDate = product.availableDates?.[0] || null;
        }
      }

      return filteredMbs;
    }

    return [];
  }

  private isProductCantSend(product: UnknownObjectType): boolean {
    return isNaN(product.price) || product.price === 0 || !product.price;
  }

  private isProductDatesNoAvailable(product: UnknownObjectType): boolean {
    if ((product.oneShotRenew || product.multiShotRenew) && product.season.renewalChangedForward) {
      return false;
    } else if (product.oneShot || product.oneShotRenew || product.overharvest || product.multiShotBox) {
      return !product.selectedDate && !product.season.checkAvailableDates;
    }

    return false;
  }

  private initMaxBoxesPerAdoption(products: UnknownObjectType[]): void {
    let adoptions: MaxBoxesPerAdoption[] = [];

    for (const product of products) {
      const { multiShotBox, multiShot, _masterBox, _upCf, numMasterBoxes, stepMS } = product;
      const isCorrectAdoption = (adoption: MaxBoxesPerAdoption): boolean =>
        _upCf ? adoption.masterBox === _masterBox && adoption.upCf === _upCf : adoption.masterBox === _masterBox && !adoption.upCf;

      if (multiShotBox || multiShot) {
        const adoptionAdded = adoptions.find(isCorrectAdoption);

        if (adoptionAdded) {
          adoptions = adoptions.map((adoption) => ({
            ...adoption,
            ...(isCorrectAdoption(adoption) && {
              totalBoxes: adoption.totalBoxes + (numMasterBoxes ?? stepMS),
            }),
          }));
        } else {
          adoptions.push({
            masterBox: _masterBox,
            totalBoxes: numMasterBoxes ?? stepMS,
            ...(_upCf && {
              upCf: _upCf,
            }),
          });
        }
      }

      this.checkoutStoreSrv.setMaxBoxesPerAdoptions(adoptions);
    }
  }
}
