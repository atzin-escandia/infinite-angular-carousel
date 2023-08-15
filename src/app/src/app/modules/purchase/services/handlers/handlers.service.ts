import { Injectable } from '@angular/core';
import { IAddress, IStripeCallbackRedirectParams, UnknownObjectType } from '../../../../interfaces';
import {
  CartsService,
  CountryService,
  DomService,
  EventService,
  LoaderService,
  PurchaseService,
  TextService,
  UserService,
  LoggerService,
  StorageService,
} from '../../../../services';
import { PopoverService } from '../../../../services/popover';
import { PopupService } from '../../../../services/popup';
import { CheckoutService } from '../checkout/checkout.service';
import { CheckoutCommonService } from '../common/common.service';
import { CheckoutGroupOrderService } from '../group-order/group-order.service';
import { CheckoutPaymentCommonService } from '../payment';
import { CheckoutProductsService } from '../products/checkout-products.service';
import { CheckoutStoreService } from '../store/checkout-store.service';
import { CheckoutNavigationService } from '../navigation/navigation.service';

@Injectable()
export class CheckoutHandlersService extends CheckoutCommonService {
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
    private checkoutSrv: CheckoutService,
    private productsSrv: CheckoutProductsService,
    private groupOrderSrv: CheckoutGroupOrderService,
    private navigationSrv: CheckoutNavigationService,
    private paymentCommonSrv: CheckoutPaymentCommonService,
    private countrySrv: CountryService,
    private domSrv: DomService,
    private popoverSrv: PopoverService
  ) {
    super(loaderSrv, eventSrv, userService, purchaseSrv, cartsSrv, popupSrv, textSrv, loggerSrv, storageSrv, checkoutStoreSrv);
  }

  openLocation(): void {
    this.domSrv.getIsDeviceSize() ? this._openMobileLocation() : this._openDefaultLocation();
  }

  afterCSProductAdded(): void {
    setTimeout(() => {
      this.domSrv.scrollToElmWithHeader(`#cart-product-item-${this.checkoutStoreSrv.products.length - 1}`, 50);
    }, 250);
  }

  async changeSection(val: -1 | 1): Promise<void> {
    await this.navigationSrv.navToCheckoutSection(this.checkoutStoreSrv.currentSectionIdx + val);
  }

  async deliveryCountryChange(isUserLogged: boolean): Promise<void> {
    const iso = this.countrySrv.getCurrentCountry().iso;

    this.checkoutStoreSrv.setCurrentIso(iso);
    isUserLogged && (await this.checkoutSrv.setAllowedPaymentMethods());
  }

  onRedirectHandler(isGroupOrder: boolean, { go_hash }: IStripeCallbackRedirectParams): void {
    if (isGroupOrder) {
      this._onRedirectAsGroupOrder(go_hash);
    } else {
      this._onRedirectByDefaultV2();
    }
  }

  async beforeChangeCountryCheck(newIso: string = this.countrySrv.getCountry()): Promise<void> {
    this.setInnerLoader(true, true);

    if (this.checkoutStoreSrv.hasMSSingleBoxesProducts) {
      try {
        await this.getCartAndValidate(newIso);
        await this._changeCountry(newIso, false);
      } catch (err) {
        this.countrySrv.setCountry(this.checkoutStoreSrv.currentIso);
        this.checkoutStoreSrv.setInvalidShipmentCountry(true);
        this.setInnerLoader(false, false);
        this.openLocation();

        throw err;
      }
    } else {
      await this._changeCountry(newIso, false);
    }
  }

  async changeToApplePayWalletAddress(newCountryIso: string): Promise<{ price: number; products: UnknownObjectType[] }> {
    this.countrySrv.setCountry(newCountryIso);
    this.checkoutStoreSrv.setCurrentIso(newCountryIso);
    await this.beforeChangeCountryCheck(newCountryIso);
    const { finalPrice, products } = this.checkoutStoreSrv;

    return { price: finalPrice, products };
  }

  async setAddressCountryIso(newCountryIso: string): Promise<void> {
    this.countrySrv.setCountry(newCountryIso);
    await this.deliveryCountryChange(this.checkoutStoreSrv.isUserLogged);
    await this.productsSrv.init();
    this.paymentCommonSrv.setPaymentMethods();
  }

  async onCountryChange(isUserLogged: boolean, refreshProducts: boolean = true): Promise<void> {
    const user = await this.getUser();

    this.checkoutStoreSrv.setUser(user);
    await this.deliveryCountryChange(isUserLogged);

    if (refreshProducts) {
      const products = await this.productsSrv.refreshPricesAndDates();
      const productsMap = this.productsSrv.checkMap(products);

      this.checkoutStoreSrv.setProducts(productsMap);
    } else {
      await this.productsSrv.init();
    }

    this.paymentCommonSrv.setPaymentMethods();
  }

  private _openMobileLocation(): void {
    this.popoverSrv.open('LocationLangMobileComponent', 'app-block', {
      inputs: { isDeliveryCountry: true, showCloseButton: true, closeOnClickCountry: true },
      outputs: {
        onClose: () => {
          void this._locationCmpOnCloseFromPurchaseNavbar();
        },
      },
    });
  }

  private _openDefaultLocation(): void {
    this.popoverSrv.open('LocationLangComponent', 'header-location', {
      inputs: {},
      outputs: {
        onClose: () => {
          void this._locationCmpOnCloseFromPurchaseNavbar();
        },
      },
    });
  }

  private _locationCmpOnCloseFromPurchaseNavbar(): void {
    this.popoverSrv.close(this.domSrv.getIsDeviceSize() ? 'LocationLangMobileComponent' : 'LocationLangComponent');
  }

  private async _changeCountry(newCountryIso: string, refreshProducts: boolean): Promise<void> {
    const products = await this.productsSrv.refreshPricesAndDates();

    this.checkoutStoreSrv.setProducts(products);
    this.checkoutStoreSrv.setCurrentIso(newCountryIso);
    this.checkoutStoreSrv.setInvalidShipmentCountry(false);
    this.checkoutStoreSrv.isUserLogged
      ? await this._changeCountryByDefault(refreshProducts)
      : await this._changeCountryWhenUserIsNotLogged();
    this.setInnerLoader(false, false);
  }

  private async _changeCountryByDefault(refreshProducts: boolean): Promise<void> {
    await this.onCountryChange(true, refreshProducts);
    const addressFound: IAddress = this.checkoutStoreSrv.user?.addresses?.find((elem) => elem.country === this.countrySrv.getCountry());

    addressFound && this.checkoutStoreSrv.setSelectedUserAddressId(addressFound.id as string);
  }

  private async _changeCountryWhenUserIsNotLogged(): Promise<void> {
    await this.deliveryCountryChange(false);
    await this.productsSrv.init();
    this.paymentCommonSrv.setPaymentMethods();
  }

  private _onRedirectAsGroupOrder(hash: string): void {
    this.groupOrderSrv.onPayCartSuccess(hash);
  }

  private _onRedirectByDefaultV2(): void {
    this.paymentCommonSrv.onPaymentSuccess();
  }
}
