import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ICountry, IAddress } from '@app/interfaces';
import { CartsService, CountryService, TextService } from '@app/services';
import { IMsgCollapsableBox } from '../../../../interfaces/msg-collapsable-box.interface';
import { MsgKeyType } from '../../../../types/msg-key.types';
import { environment } from '../../../../../../../environments/environment';
import { CheckoutService } from '../../../../services/checkout/checkout.service';
import { PurchaseCoreService } from '../../../../services/purchase.service';
import { CheckoutStoreService } from '@modules/purchase/services';
import { PurchaseError } from '@app/modules/purchase/models/error.model';

@Component({
  selector: 'checkout-shipment-section',
  templateUrl: './checkout-shipment-section.component.html',
  styleUrls: ['./checkout-shipment-section.component.scss'],
})
export class CheckoutShipmentSectionComponent implements OnInit {
  public env = environment;

  @Input() set addresses(addresses: IAddress[]) {
    this._addresses = addresses || [];
    this.addresses.length ? this.goToDefaultView() : this.addNewAddress();
  }

  get addresses(): IAddress[] {
    return this.sortAddresses();
  }

  get showAddressFormFavCheckbox(): boolean {
    return (
      (!this.addressToEdit && !!this.addresses.length) || (this.addresses.length > 1 && this.addressToEdit && !this.addressToEdit.favourite)
    );
  }

  @Input() selectedAddressId: string;
  @Input() hasUnavailableProducts = false;
  @Input() countriesByIso: { [key: string]: ICountry };
  @Input() currentIso: string;
  @Input() shipperMsg: IMsgCollapsableBox = this.checkoutSrv.msgCollapsableBoxInit(35);
  @Input() dedicatoryMsg: IMsgCollapsableBox = this.checkoutSrv.msgCollapsableBoxInit(500);
  @Input() isGroupOrder: boolean;
  @Input() isCartInvalid: boolean;

  @Output() changeSection = new EventEmitter<-1 | 1>();
  @Output() selectedAddressChange = new EventEmitter<string>();
  @Output() addressesOnChange = new EventEmitter<string>();
  @Output() msgActiveChange = new EventEmitter<{ value: boolean; key: MsgKeyType }>();
  @Output() msgValueChange = new EventEmitter<{ value: string; key: MsgKeyType }>();

  get maxAddresses(): IAddress[] {
    return this.fullListLength ? this.addresses : this.addresses.length >= 2 ? this.addresses.slice(0, 2) : this.addresses;
  }

  get isOptionSelected(): boolean {
    return !!this.purchaseCoreSrv.store.getSelectedUserAddress();
  }

  get isContinueButtonDisabled(): boolean {
    return this.hasUnavailableProducts || !this.selectedAddressId || this.isCartInvalid;
  }

  get isCrowdgivingAvailable(): boolean {
    return (
      this.checkoutStoreSrv.currentIso === 'pl' &&
      !this.checkoutStoreSrv.isAnyProductSubscriptionActive &&
      !this.checkoutStoreSrv.isGroupOrder &&
      this.checkoutStoreSrv.products.every((product) => product.type === 'OVERHARVEST')
    );
  }

  private _addresses: IAddress[] = [];

  public selectedAddress$ = this.checkoutStoreSrv.selectedUserAddress$;
  public showNavigationButtons = true;
  public displayType: 'default' | 'select' | 'edit' | 'add' = 'default';
  public isAddressSelectorActive = false;
  public addressToEdit: IAddress = null;
  public fullListLength = false;
  public canShowGiftAddressMessage = this.checkoutStoreSrv.products.some((_, i) => this.cartSrv.getByIdx(i)?.gift?.isActiveGift);

  constructor(
    public textSrv: TextService,
    private countrySrv: CountryService,
    private purchaseCoreSrv: PurchaseCoreService,
    private checkoutSrv: CheckoutService,
    private cartSrv: CartsService,
    private checkoutStoreSrv: CheckoutStoreService
  ) {}

  ngOnInit(): void {
    void this.initAsync();
  }

  async initAsync(): Promise<void> {
    if (this.selectedAddressId) {
      if (this.countrySrv.getCountry() !== this.checkoutStoreSrv.getSelectedUserAddress()?.country) {
        this.purchaseCoreSrv.common.setInnerLoader(true, true);

        try {
          this.countrySrv.setCountry(this.checkoutStoreSrv.getSelectedUserAddress().country);
          await this.purchaseCoreSrv.products.updatePriceAndProducts();
        } catch (err) {
          this.purchaseCoreSrv.common.logError(err);
        } finally {
          this.purchaseCoreSrv.common.setInnerLoader(false, false);
        }
      }
    } else if (this.addresses.length) {
      this.displayType = 'select';
      this.isAddressSelectorActive = true;
    }

    void this.checkGroupOrder();
  }

  async checkGroupOrder(): Promise<void> {
    const { isGroupOrderAvailable, isGroupOrder, cart } = this.purchaseCoreSrv.store;

    if (isGroupOrderAvailable && isGroupOrder) {
      if (!cart) {
        try {
          await this.purchaseCoreSrv.groupOrder.setCart();
        } catch (err) {
          this.purchaseCoreSrv.common.logError(err);
        }
      }

      if (this.purchaseCoreSrv.store.getSelectedUserAddress()) {
        try {
          await this._setGroupOrderCart();
        } catch (err) {
          this.purchaseCoreSrv.common.logError(err);
          this.changeToBackSection();
        }
      }
    }
  }

  addressSelectorActiveToggle(): void {
    this.isAddressSelectorActive = !this.isAddressSelectorActive;
    this.displayType = this.isAddressSelectorActive ? 'select' : 'default';
    this.showNavigationButtons = !this.isAddressSelectorActive;
  }

  handleOptionSelected(index: number): void {
    this.selectedAddressChange.emit(this.addresses[index].id as string);
  }

  handleEditAddress(id?: string): void {
    this.displayType = 'edit';
    this.addressToEdit = this.addresses.find((elem) => elem.id === (id || this.purchaseCoreSrv.store.selectedUserAddressId));
    this.showNavigationButtons = false;
  }

  addNewAddress(): void {
    this.displayType = 'add';
    this.addressToEdit = null;
    this.showNavigationButtons = false;
  }

  handleGoBack(): void {
    this.displayType = 'default';
    this.addressToEdit = null;
    this.showNavigationButtons = !this.isAddressSelectorActive;
  }

  submitFormHandler(value: IAddress): void {
    this.addressToEdit
      ? this.purchaseCoreSrv.store.updateUserAddress(this.addressToEdit.id as string, value)
      : this.purchaseCoreSrv.store.addUserAddress(value);

    if (this.purchaseCoreSrv.store.canSetNewAddressAsSelected(value, this.currentIso)) {
      this.purchaseCoreSrv.store.setSelectedUserAddressId(value.id as string);
      this.addressesOnChange.emit(value.id as string);
    } else {
      this.purchaseCoreSrv.common.setInnerLoader(false, false);
    }

    this.goToDefaultView();
  }

  changeToBackSection(): void {
    this.changeSection.emit(-1);
  }

  async changeToNextSection(): Promise<void> {
    if (this.isContinueButtonDisabled) {
      return;
    }

    try {
      const { isGroupOrderAvailable, isGroupOrder, currentIso } = this.purchaseCoreSrv.store;
      const selectedUserAddress = this.purchaseCoreSrv.store.getSelectedUserAddress();

      this.purchaseCoreSrv.common.setInnerLoader(true, true);

      if (isGroupOrderAvailable && isGroupOrder) {
        await this._setGroupOrderCart();
      }

      if (currentIso !== selectedUserAddress?.country) {
        await this.purchaseCoreSrv.handlers.setAddressCountryIso(selectedUserAddress?.country);
      }

      this.changeSection.emit(1);
    } catch (err) {
      this.purchaseCoreSrv.common.displayStatusPopup(true, err?.displayErrorMessage);
      this.purchaseCoreSrv.common.logError(err);
    } finally {
      this.purchaseCoreSrv.common.setInnerLoader(false, false);
    }
  }

  private async _setGroupOrderCart(): Promise<void> {
    try {
      const cart = await this.purchaseCoreSrv.groupOrder.handleGroupOrderShipment();

      this.purchaseCoreSrv.store.setCart(cart);
    } catch (err) {
      throw new PurchaseError({
        name: 'CHECKOUT_SECTION_SHIPMENT_ERROR',
        message: 'Set Group Order cart error',
        cause: err,
      });
    }
  }

  msgActiveOnChange(value: boolean, key: MsgKeyType): void {
    this.msgActiveChange.emit({ value, key });
  }

  msgValueOnChange(value: string, key: MsgKeyType): void {
    this.msgValueChange.emit({ value, key });
  }

  public goToDefaultView(): void {
    this.isAddressSelectorActive = false;
    this.displayType = 'default';
    this.showNavigationButtons = true;
  }

  public goToSelectView(): void {
    this.isAddressSelectorActive = true;
    this.displayType = 'select';
    this.showNavigationButtons = false;
  }

  private sortAddresses(): IAddress[] {
    if (this.selectedAddressId) {
      const addressFound = this._addresses.find((elem) => elem.id === this.selectedAddressId);

      if (addressFound) {
        return [addressFound, ...this._addresses.filter((elem) => elem.id !== this.selectedAddressId)];
      }
    }

    return this._addresses;
  }
}
