import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ICountry, IAddress } from '@app/interfaces';
import { TextService } from '@app/services';
import { environment } from '../../../environments/environment';
import { ShipmentStoreService } from './store/store.service';

@Component({
  selector: 'shipment-app',
  templateUrl: './shipment.component.html',
  styleUrls: ['./shipment.component.scss'],
})
export class ShipmentComponent implements OnInit {
  public env = environment;

  @Input() set addresses(addresses: IAddress[]) {
    this.shipmentStoreSrv.setUserAddresses(addresses || []);
    addresses.length ? this.goToDefaultView() : this.addNewAddress();
  }

  get addresses(): IAddress[] {
    return this.sortAddresses();
  }

  get showAddressFormFavCheckbox(): boolean {
    return (
      (!this.addressToEdit && !!this.addresses.length) || (this.addresses.length > 1 && this.addressToEdit && !this.addressToEdit.favourite)
    );
  }

  @Input() set selectedAddressId(selectedAddressId: string) {
    this.shipmentStoreSrv.setSelectedUserAddressId(selectedAddressId);
  }

  get selectedAddressId(): string {
    return this.shipmentStoreSrv.selectedUserAddressId;
  }

  @Input() countriesByIso: { [key: string]: ICountry };
  @Input() currentIso: string;

  @Output() selectedAddressChange = new EventEmitter<IAddress>();
  @Output() addressesOnChange = new EventEmitter<IAddress>();
  @Output() editingAddress = new EventEmitter<boolean>();

  get maxAddresses(): IAddress[] {
    return this.fullListLength ? this.addresses : this.addresses.length >= 2 ? this.addresses.slice(0, 2) : this.addresses;
  }

  get isOptionSelected(): boolean {
    return !!this.shipmentStoreSrv.getSelectedUserAddress();
  }

  public selectedAddress$ = this.shipmentStoreSrv.selectedUserAddress$;
  public displayType: 'default' | 'select' | 'edit' | 'add' = 'default';
  public isAddressSelectorActive = false;
  public addressToEdit: IAddress = null;
  public fullListLength = false;

  constructor(
    public textSrv: TextService,
    private shipmentStoreSrv: ShipmentStoreService,
  ) {}

  ngOnInit(): void {
    if (this.addresses.length && !this.selectedAddressId) {
      this.displayType = 'select';
      this.isAddressSelectorActive = true;
    }
  }

  addressSelectorActiveToggle(): void {
    this.isAddressSelectorActive = !this.isAddressSelectorActive;
    this.displayType = this.isAddressSelectorActive ? 'select' : 'default';
  }

  handleOptionSelected(index: number): void {
    this.selectedAddressChange.emit(this.addresses[index]);
  }

  handleEditAddress(id?: string): void {
    this.editingAddress.emit(true);
    this.displayType = 'edit';
    this.addressToEdit = this.addresses.find((elem) => elem.id === (id || this.shipmentStoreSrv.selectedUserAddressId));
  }

  addNewAddress(): void {
    this.displayType = 'add';
    this.addressToEdit = null;
  }

  handleGoBack(): void {
    this.editingAddress.emit(false);
    this.displayType = 'default';
    this.addressToEdit = null;
  }

  submitFormHandler(value: IAddress): void {
    this.addressToEdit
      ? this.shipmentStoreSrv.updateUserAddress(this.addressToEdit.id as string, value)
      : this.shipmentStoreSrv.addUserAddress(value);

    this.shipmentStoreSrv.setSelectedUserAddressId(value.id as string);
    this.addressesOnChange.emit(value);
    this.goToDefaultView();
  }

  public goToDefaultView(): void {
    this.isAddressSelectorActive = false;
    this.displayType = 'default';
  }

  public goToSelectView(): void {
    this.isAddressSelectorActive = true;
    this.displayType = 'select';
  }

  private sortAddresses(): IAddress[] {
    const userAddresses = this.shipmentStoreSrv.userAddresses;

    if (this.selectedAddressId) {
      const addressFound = userAddresses.find((elem) => elem.id === this.selectedAddressId);

      if (addressFound) {
        return [addressFound, ...userAddresses.filter((elem) => elem.id !== this.selectedAddressId)];
      }
    }

    return userAddresses;
  }
}
