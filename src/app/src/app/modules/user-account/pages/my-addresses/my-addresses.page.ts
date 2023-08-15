import { Component, OnInit, Injector, AfterViewInit } from '@angular/core';
import { BasePage } from '@app/pages';
import { AuthService, EventService, CountryService, CheckDataService, TrackingService, TrackingConstants } from '@app/services';
import { ConfirmationPopupComponent } from '@popups/confirmation-popup';
import { StatusPopupComponent } from '@popups/status-popup';
import { AddressService } from '@services/adress';
import { AddressPopupValidatorComponent } from '@popups/address-validator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IAddress } from '@app/interfaces';

@Component({
  selector: 'my-addresses',
  templateUrl: './my-addresses.page.html',
  styleUrls: ['./my-addresses.page.scss'],
})
export class MyAddressesPageComponent extends BasePage implements OnInit, AfterViewInit {
  public countriesByIso: any = {};
  public addAddress = false;
  public editAddress = false;
  public validatorAddress: IAddress;
  public addressToEdit: any = this.utilsSrv.addressTemp();
  public addressToAdd: IAddress;
  public errorIn: any = this.errorInTemplate();
  public maxMask = 0;
  public addressAsDefault = false;
  public address: IAddress;

  constructor(
    public injector: Injector,
    public authSrv: AuthService,
    public eventSrv: EventService,
    public countrySrv: CountryService,
    public checkSrv: CheckDataService,
    public addressSrv: AddressService,
    private trackingSrv: TrackingService,
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    // Load user data and countries on base page
    const [countriesIso] = await Promise.all([this.countrySrv.getCountriesByISO(), this.loadUser(true), this.loadCountries()]);

    this.countriesByIso = countriesIso;

    if (!this.user.addresses || this.user.addresses.length === 0) {
      this.user.addresses = [];
      this.addingStatus({ add: true, edit: false });
      this.addressAsDefault = true;
    } else {
      this.user.addresses.sort((a, b) => b.favourite - a.favourite);
    }

    // Let private zone menu know that this component is open
    this.eventSrv.dispatchEvent('private-zone-url', { router: this.routerSrv.getPath() });
    this.setLoading(false);
    this.setInnerLoader(false, false);
  }

  /**
   * Pass autoLogin validation
   */
  public autoLoginValidation(funcName: string, args?: any): void {
    void this.checkLogin(() => this[funcName](...args));
  }

  /**
   * changes the favourite address in the user addresses array and opens warning message. Service sorts addresses by itself
   */
  public async selectFavourite(id: number): Promise<void> {
    this.user.addresses[id].favourite = true;
    try {
      const newAddresses = await this.userService.editAddress(this.user.addresses[id], id);

      this.user.addresses = newAddresses.addresses;
    } catch (error) {
      console.log(error);
    }

    this.setPopupMsg('notifications.default-address-updated.text-info');
  }

  public addingStatus({ add, edit }: { add: boolean; edit: boolean }, id?: number): void {
    this.addAddress = add;
    this.editAddress = edit;

    this.addressAsDefault = !this.user.addresses.some((address) => !!address.favourite);

    if (add) {
      this.addressToAdd = this.utilsSrv.addressTemp();
    }

    if (edit) {
      this.addressToEdit = this.user.addresses[id];
      this.addressToEdit.addressId = id;
    }

    if (!add || !edit) {
      this.domSrv.scrollToTop();
    }

    if (add || edit) {
      this.errorIn = this.errorInTemplate();
    }
  }

  /**
   * Deletes addresses and opens warning message
   */
  public deleteAddress(id: number, fav: boolean): void {
    const popup = this.popupSrv.open(ConfirmationPopupComponent, {
      data: {
        title: 'globa.delete-address.text-link',
        msg: 'page.Address-delete-confirm.text-info',
        ...(fav && { subMsg: 'page.primary-shipping-address.body' }),
      },
    });

    popup.onClose.subscribe(async (result) => {
      if (result) {
        this.user.addresses.splice(id, 1);
        try {
          await this.userService.removeAddress(this.user.addresses);
          await this.userService.get(true);
          this.setPopupMsg('Address successfuly deleted');
        } catch (err) {
          this.setPopupMsg(err, true);
        }

        if (!this.user.addresses || this.user.addresses.length === 0) {
          this.addingStatus({ add: true, edit: false });
        }
      }
    });
  }

  public async saveAddress(): Promise<void> {
    let address: any;
    let id: number;

    if (this.addAddress) {
      address = this.addressToAdd;
      if (this.user.addresses?.length === 0 || this.addressAsDefault) {
        address.favourite = true;
      }
    } else {
      address = this.addressToEdit;
      id = this.addressToEdit.addressId;
    }

    this.checkErorrs(address);
    if (!this.checkSrv.formValidation(this.errorIn, true)) {
      return;
    } else {
      await this.addressValidation(address, id);
    }
  }

  public checkErorrs(address: any): void {
    let isError: boolean;

    for (const key in this.errorIn) {
      if (key !== 'validZip' && key !== 'lengthZip') {
        this.checkSrv.manageInput(address, this.errorIn, this.countriesByIso, this.maxMask, key, false);
      } else if (key === 'validZip' && address.country) {
        this.errorIn.validZip = !this.checkSrv.hasValidPrefixZip(this.countriesByIso[address.country], address.zip, isError);
      } else if (key === 'lengthZip' && address.country) {
        this.errorIn.lengthZip = !this.checkSrv.hasValidMaskLenght(
          this.countriesByIso[address.country],
          address.zip,
          this.maxMask,
          isError
        );
      }
    }

    if (!this.checkSrv.hasValidPrefixZip(this.countriesByIso[address.country], address.zip, isError)) {
      isError = false;
    }
  }

  public errorInTemplate(): any {
    return {
      name: false,
      surnames: false,
      street: false,
      number: false,
      details: false,

      phoneNumber: false,
      phonePrefix: false,
      country: false,
      province: false,
      zip: false,
      validZip: false,
      lengthZip: false,
      city: false,
    };
  }

  public async addressValidation(address: IAddress, id: number): Promise<any> {
    let popup: any = '';

    const addressFormat: any = {
      city: address.city,
      country: address.country,
      number: address.number,
      street: address.street,
      zip: address.zip,
      province: address.province ? address.province : address.city,
    };

    const validation = await this.addressSrv.validate(addressFormat);

    if (validation.status !== 'registered') {
      if (validation.status === 'validated') {
        await this.addressSrv.sendHash(addressFormat, 'SOFT_VALIDATION_USER');
        await this.processAddress(address, id);
        this.addAddress = false;
        this.editAddress = false;
        this.validatorAddress = address;
      } else {
        address.province = address.province ? address.province : address.city;
        const valAddress = { address, checkAddress: validation.address, status: validation.status };

        popup = this.popupSrv.open(AddressPopupValidatorComponent, { data: valAddress });
        const unsub = new Subject<void>();

        popup.onClose.pipe(takeUntil(unsub)).subscribe(async (result) => {
          unsub.next();
          if (result) {
            if (result.sugg) {
              this.validatorAddress = result.sugg;
              await this.processAddress(this.validatorAddress, id);
            } else {
              await this.processAddress(address, id);
            }
            this.editAddress = result.edit;
            this.addAddress = result.add;
          }
          unsub.complete();
        });
      }
    } else {
      await this.processAddress(address, id);
      this.addAddress = false;
      this.editAddress = false;
      this.validatorAddress = address;
    }
  }

  public async processAddress(address: IAddress, id: number): Promise<any> {
    let addressData: any;

    if (this.addAddress) {
      if (!address.province) {
        address.province = address.city;
      }
      if (this.addressAsDefault) {
        address.favourite = true;
        addressData = await this.userService.addAddress(address);
        this.user.addresses = addressData;
      } else {
        addressData = await this.userService.addAddress(address);
      }
    } else {
      addressData = await this.userService.editAddress(address, id);
    }
    this.user.addresses = addressData.addresses;
    this.user.addresses.sort((a, b) => b.favourite - a.favourite);
    this.setPopupMsg('notifications.default-address-updated.text-info');
  }

  public setPopupMsg(msg: string, error = false): void {
    const data = error ? { err: msg } : { msgSuccess: msg };

    this.popupSrv.open(StatusPopupComponent, {
      data,
    });
  }

  ngAfterViewInit(): void {
    const customEventData = {
      cf_page_title: TrackingConstants.GTM4.CF_PAGE_TITLE.ACCOUNT_MY_ADDRESSES,
      page_type: TrackingConstants.GTM4.PAGE_TYPE.MY_ACCOUNT,
      language: this.langSrv.getCurrentLang(),
      country_delivery: this.countrySrv.getCurrentCountry()?.iso
    };

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PAGE_VIEW, false, customEventData);
  }
}
