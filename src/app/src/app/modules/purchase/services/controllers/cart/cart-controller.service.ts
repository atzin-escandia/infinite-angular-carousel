import { Injectable } from '@angular/core';
import { IEcommerceTracking, UnknownObjectType } from '@app/interfaces';
import {
  CartsService,
  DEFAULT_LIST_NAME,
  EventService,
  LoaderService,
  LoggerService,
  PurchaseService,
  StorageService,
  SubscriptionService,
  TextService,
  TrackingConstants,
  TrackingService,
  UserService,
} from '@app/services';
import { PopupService } from '@app/services/popup';
import { CheckoutCommonService } from '../../common/common.service';
import { CheckoutStoreService } from '../../store/checkout-store.service';
import { CheckoutProductsService } from '../../products/checkout-products.service';
import { PurchaseError } from '@app/modules/purchase/models/error.model';
import { ISubscriptionConfiguration } from '@app/interfaces/subscription.interface';
import { ISubscriptionAvailability } from '@app/interfaces/subscription.interface';
import { IProductUpdateParams } from '@app/modules/purchase/interfaces/product.interface';
import { CheckoutHandlersService } from '../../handlers/handlers.service';
import { CrossSellingBlockComponent } from '@app/components';
import { PRODUCT_TYPE } from '@app/constants/product.constants';
import { ParseArticlesService } from '@app/modules/e-commerce/services/parse-articles/parse-articles.service';

@Injectable()
export class CheckoutCartControllerService extends CheckoutCommonService {
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
    public subscriptionSrv: SubscriptionService,
    public checkoutStoreSrv: CheckoutStoreService,
    public checkoutProductsSrv: CheckoutProductsService,
    public checkoutHandlersSrv: CheckoutHandlersService,
    private trackingSrv: TrackingService,
    private parseEcArticlesSrv: ParseArticlesService,
  ) {
    super(loaderSrv, eventSrv, userService, purchaseSrv, cartsSrv, popupSrv, textSrv, loggerSrv, storageSrv, checkoutStoreSrv);
  }

  async onRemoveProduct(idx: number): Promise<void> {
    this.setInnerLoader(true, true);

    try {
      const productsInCartBeforeRemoving = this.checkoutStoreSrv.products;
      const cart = this.cartsSrv.get();

      cart[idx]?.type === PRODUCT_TYPE.ECOMMERCE ? this.parseEcArticlesSrv.clearBoxShoppingList() : this.cartsSrv.remove(idx);
      this.checkoutStoreSrv.setProducts(this.checkoutStoreSrv.products.filter((_, i) => i !== idx));
      await this.checkoutProductsSrv.updatePrice();
      this.trackGA4RemoveFromCart(idx, productsInCartBeforeRemoving);
    } catch (err) {
      this.logError(
        new PurchaseError({
          name: 'CART_ERROR',
          message: 'Remove product error',
          cause: err,
        })
      );

      throw err;
    } finally {
      this.setInnerLoader(false, false);
    }
  }

  async onAddCSProduct(CSBlockCmp: CrossSellingBlockComponent): Promise<void> {
    this.setInnerLoader(true, true);

    try {
      await this.checkoutProductsSrv.updatePriceAndProducts();
      this.checkoutHandlersSrv.afterCSProductAdded();
      CSBlockCmp.loadPromos();
    } catch (err) {
      this.logError(
        new PurchaseError({
          name: 'CART_ERROR',
          message: 'Add CS product error',
          cause: err,
        })
      );

      throw err;
    } finally {
      this.setInnerLoader(false, false);
    }
  }

  async onUpdateProduct({ cartItem, product, subsConfig, idx, isRefresh }: IProductUpdateParams & { idx: number }): Promise<void> {
    this.setInnerLoader(true, true);

    try {
      subsConfig ? this.subscriptionHanlder(cartItem, product, idx, subsConfig) : this.cartsSrv.updateByIdx(cartItem, idx);

      if (isRefresh) {
        await this.checkoutProductsSrv.updatePriceAndProducts();
      } else {
        this.checkoutStoreSrv.updateProduct(idx, product);
      }
    } catch (err) {
      this.logError(
        new PurchaseError({
          name: 'CART_ERROR',
          message: 'Update product error',
          cause: err,
        })
      );

      throw err;
    } finally {
      this.setInnerLoader(false, false);
    }
  }

  private subscriptionHanlder(
    cartItem: UnknownObjectType,
    product: UnknownObjectType,
    idx: number,
    config: ISubscriptionConfiguration
  ): void {
    const subscriptionAvailability: ISubscriptionAvailability = product.subscription;
    const isSubscriptionAvailable = !!subscriptionAvailability;

    this.checkoutStoreSrv.setIsAnyProductSubscriptionActive(cartItem?.subscription?.isActive || false);

    if (isSubscriptionAvailable) {
      const activeCartInfoMapTo = {
        ...cartItem,
        selectedDate: config.date,
        subscription: {
          ...config,
          startDate: config.date,
          isActive: cartItem?.subscription?.isActive ?? false,
        },
      };

      this.cartsSrv.updateByIdx(activeCartInfoMapTo, idx);

      this.checkoutStoreSrv.updateProduct(idx, {
        ...product,
        selectedDate: config.date,
      });
    }
  }

  // TODO: fill in with IEcommerceTracking
  private trackGA4RemoveFromCart(idx: number, products: UnknownObjectType[]): void {
    const project = products[idx];
    const PRODUCT_CODE = project.up?.code;
    const trackingProjectAlreadyVisited = PRODUCT_CODE && this.storageSrv.get(PRODUCT_CODE);
    const items: IEcommerceTracking[] = [];
    const listName = trackingProjectAlreadyVisited?.item_list_name ?? DEFAULT_LIST_NAME;
    const position = trackingProjectAlreadyVisited?.index ?? this.trackingSrv.getPosition();
    const farmName = project?.farm?._m_name?.en;

    project &&
      items.push({
        index: position,
        item_brand: farmName,
        currency: project.currency?.crowdfarmer?.currency,
        price: project.price,
        item_variant: project?.overharvest ? TrackingConstants.ITEM_VARIANT.OH : TrackingConstants.ITEM_VARIANT.ADOPT,
        quantity: 1,
        item_id: project._up,
        item_category: project.up?._m_category?.en,
        item_category2: project.up?._m_subcategory?.en,
        item_category3: project.up?._m_variety?.en,
        item_category4: project.up?._m_subvariety?.en,
        item_list_name: listName,
        item_name: PRODUCT_CODE,
        // cart_number_items
        // product_id: e.code, product category id ?
        product_code: PRODUCT_CODE,
        // product_project_code: product_id + e.code
        // product_page:
        // product_delivery_plan:
        // product_cost_calculator:
        // product_stock:
        // product_units_left:
        // product_days_left:
        // farmer_country:
        // product_soon:
        // link_type:
        // search_term:
        // product_gift:
      } as IEcommerceTracking);

      const currentItem: IEcommerceTracking = items[0];
      const productCode: string = currentItem && currentItem.product_code;
      const hasAnotherProductInCartLikeThis = products.filter(p => p.up?.code === PRODUCT_CODE)?.length > 1;

      // Only when there is no other item with same product code in the cart
      productCode && !hasAnotherProductInCartLikeThis && this.trackingSrv.deleteTrackingStorageProject(productCode);
    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.REMOVE_FROM_CART, true, { items });
  }
}
