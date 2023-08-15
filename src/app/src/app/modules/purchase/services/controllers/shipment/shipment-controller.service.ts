import { Injectable } from '@angular/core';
import { PurchaseError } from '@app/modules/purchase/models/error.model';
import {
  CheckoutShipmentSectionComponent
} from '@app/modules/purchase/pages/checkout/sections/shipment/checkout-shipment-section.component';
import {
  CartsService,
  CountryService,
  DomService,
  EventService,
  LoaderService,
  LoggerService,
  PurchaseService,
  StorageService,
  TextService,
  UserService,
} from '@app/services';
import { PopupService } from '@app/services/popup';
import { CheckoutService } from '../../checkout/checkout.service';
import { CheckoutCommonService } from '../../common/common.service';
import { CheckoutGroupOrderService } from '../../group-order/group-order.service';
import { CheckoutHandlersService } from '../../handlers/handlers.service';
import { CheckoutStoreService } from '../../store/checkout-store.service';

@Injectable()
export class CheckoutShipmentControllerService extends CheckoutCommonService {
  constructor(
    public loaderSrv: LoaderService,
    public eventSrv: EventService,
    public userService: UserService,
    public purchaseSrv: PurchaseService,
    public cartsSrv: CartsService,
    public popupSrv: PopupService,
    public textSrv: TextService,
    public storageSrv: StorageService,
    public checkoutStoreSrv: CheckoutStoreService,
    public loggerSrv: LoggerService,
    private countrySrv: CountryService,
    private domSrv: DomService,
    private checkoutSrv: CheckoutService,
    private checkoutGroupOrderSrv: CheckoutGroupOrderService,
    private checkoutHandlersSrv: CheckoutHandlersService
  ) {
    super(loaderSrv, eventSrv, userService, purchaseSrv, cartsSrv, popupSrv, textSrv, loggerSrv, storageSrv, checkoutStoreSrv);
  }

  async onSelectedAddressChange(
    id: string,
    shipmentSectionCmp: CheckoutShipmentSectionComponent
  ): Promise<void> {
    this.setInnerLoader(true, true);

    try {
      await this._onSelectedAddressChange(id);
      shipmentSectionCmp?.goToDefaultView();
      await this._setGroupOrderAddress();
      this.domSrv.scrollToTop();
    } catch (err) {
      this.displayStatusPopup(true, err?.displayErrorMessage);
      this.logError(err);
    } finally {
      this.setInnerLoader(false, false);
    }
  }

  async addressesOnChange(selectedAddressId: string): Promise<void> {
    this.setInnerLoader(true, true);

    try {
      await this._checkSelectedAddressCountry(selectedAddressId);
      await this._setGroupOrderAddress();
    } catch (err) {
      this.displayStatusPopup(true, err?.displayErrorMessage);
      this.logError(err);
    } finally {
      this.setInnerLoader(false, false);
    }
  }

  private async _onSelectedAddressChange(id: string): Promise<void> {
    if (this.checkoutStoreSrv.hasMSSingleBoxesProducts) {
      const selectedUserAddressCountryIso = this.checkoutStoreSrv.getSelectedUserAddress(id)?.country;

      try {
        await this.checkoutSrv.getCartAndValidate(selectedUserAddressCountryIso);
        await this._checkSelectedAddressCountry(id);
      } catch (err) {
        this.displayGenericPopUp('order-error', err?.displayErrorMessage);

        throw new PurchaseError({
          name: 'ADDRESS_ERROR',
          message: 'On selected address change error',
          cause: err,
        });
      }
    } else {
      await this._checkSelectedAddressCountry(id);
    }
  }

  private async _checkSelectedAddressCountry(selectedAddressId: string): Promise<void> {
    const selectedAddressIso = this.checkoutStoreSrv.getSelectedUserAddress(selectedAddressId)?.country;

    if (selectedAddressIso !== this.checkoutStoreSrv.currentIso) {
      this.countrySrv.setCountry(selectedAddressIso);
      await this.checkoutHandlersSrv.onCountryChange(this.checkoutStoreSrv.isUserLogged);
      this.checkoutStoreSrv.setSelectedUserAddressId(selectedAddressId);
    } else {
      await new Promise((resolve) => {
        setTimeout(() => {
          this.checkoutStoreSrv.setSelectedUserAddressId(selectedAddressId);
          resolve(true);
        }, 500);
      });
    }
  }

  private async _setGroupOrderAddress(): Promise<void> {
    const { isGroupOrderAvailable, isGroupOrder } = this.checkoutStoreSrv;

    if (isGroupOrderAvailable && isGroupOrder) {
      await this.checkoutGroupOrderSrv.handleGroupOrderShipment();
    }
  }
}
