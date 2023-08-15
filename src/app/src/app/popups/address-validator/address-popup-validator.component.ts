import { Component, Injector, OnInit } from '@angular/core';
import { CountryService, UserService } from '@app/services';
import { AddressService } from '@services/adress';
import { BaseComponent } from '@components/base';
import { PopupsInterface } from '../popups.interface';
import { PopupsRef } from '../popups.ref';

@Component({
  selector: 'address-popup-validator-component',
  templateUrl: './address-popup-validator.component.html',
  styleUrls: ['./address-popup-validator.component.scss'],
})
export class AddressPopupValidatorComponent extends BaseComponent implements OnInit {
  public countriesByIso: any = {};
  public activeSugg: boolean;
  public activeAddress: boolean;
  public suggestionAddress: any = {};
  public saveAddress: any = {};
  public onClose: any;
  public streetChange: boolean;
  public zipChange: boolean;
  public cityChange: boolean;
  public countryChange: boolean;
  public isFromPopUp: boolean;

  constructor(
    public injector: Injector,
    public config: PopupsInterface,
    public popup: PopupsRef,
    private countrySrv: CountryService,
    public userService: UserService,
    public addressSrv: AddressService
  ) {
    super(injector);
    this.activeSugg = false;
    this.activeAddress = true;
    this.streetChange = false;
    this.zipChange = false;
    this.cityChange = false;
    this.countryChange = false;
  }

  async ngOnInit(): Promise<any> {
    this.isFromPopUp = this.config.fromPopUp;
    this.saveAddress = this.config.data.address;
    this.suggestionAddress = this.config.data.status === 'partially validated' ? this.config.data.checkAddress : false;
    this.countriesByIso = await this.countrySrv.getCountriesByISO();
    this.compareAddress();
  }

  public compareAddress(): void {
    if (this.saveAddress.street !== this.suggestionAddress.street) {
      this.streetChange = true;
    }

    if (this.saveAddress.zip !== this.suggestionAddress.zip) {
      this.zipChange = true;
    }

    if (this.saveAddress.city !== this.suggestionAddress.city) {
      this.cityChange = true;
    }

    if (this.suggestionAddress.country !== this.saveAddress.country) {
      this.countryChange = true;
    }
  }

  public onSuggestion(): any {
    this.activeSugg = true;
    this.activeAddress = false;
  }

  public onAddress(): any {
    this.activeAddress = true;
    this.activeSugg = false;
  }

  public async onEdit(): Promise<any> {
    await this.onClose();
  }

  public async onSubmit(): Promise<any> {
    if (this.activeSugg) {
      this.suggestionAddress = {
        ...this.saveAddress,
        ...this.suggestionAddress,
        province: this.saveAddress.province || this.saveAddress.city,
      };
      await this.onClose({ sugg: this.suggestionAddress, add: false, edit: false });
      if (!this.config.data.edit) {
        await this.addressSrv.sendHash(this.suggestionAddress, 'SOFT_VALIDATION_API');
      }
    } else {
      await this.onClose({ sugg: false, add: false, edit: false });
      if (!this.config.data.edit) {
        await this.addressSrv.sendHash(this.saveAddress, 'SOFT_VALIDATION_USER');
      }
    }

    if (this.config.data.edit) {
      await this.userService.get(true);
    }
  }
}
