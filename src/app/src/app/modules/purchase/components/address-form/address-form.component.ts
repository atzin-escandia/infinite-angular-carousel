/* eslint-disable @typescript-eslint/unbound-method */
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ICountry, IAddress } from '../../../../interfaces';
import { AddressPopupValidatorComponent } from '../../../../popups/address-validator';
import { StatusPopupComponent } from '../../../../popups/status-popup';
import { CheckDataService, CountryService, LangService, TextService, UserService, USStatesService } from '../../../../services';
import { AddressService } from '../../../../services/adress';
import { CaProvincesService } from '../../../../services/ca-provinces';
import { PopupService } from '../../../../services/popup';
import { ICountryOpt } from '../../../../components/_atomic/interfaces/option.interface';
import { PurchaseCoreService } from '../../services/purchase.service';
import { PurchaseError } from '../../models/error.model';

@Component({
  selector: 'address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss'],
})
export class AddressFormComponent implements OnInit, OnDestroy {
  @Input() set addressToEdit(addressToEdit: IAddress) {
    this._addressToEdit = addressToEdit;

    if (addressToEdit) {
      this.addressForm.patchValue(addressToEdit);
      this.checkForSpecialCounties();
    }
  }

  get addressToEdit(): IAddress {
    return this._addressToEdit;
  }

  @Input() canGoBack = false;
  @Input() showFavCheckbox = true;
  @Input() countriesByIso: { [key: string]: ICountry };

  @Input() set canEdit(canEdit: boolean) {
    this._canEdit = typeof canEdit === 'boolean' ? canEdit : true;

    if (this.addressForm) {
      canEdit ? this.addressForm.enable() : this.addressForm.disable();
    }
  }

  get canEdit(): boolean {
    return this._canEdit;
  }

  @Input() isCrowdgiving: boolean;

  @Output() goBack = new EventEmitter();
  @Output() submitForm = new EventEmitter();

  public addressForm: UntypedFormGroup = this.buildForm();
  public countries: ICountry[] = [];
  private _addressToEdit: IAddress;
  private _canEdit = true;
  private zipControlSubscription = new Subscription();
  public isInvalidZip = false;
  public caProvinces = [];
  public selectedCaProvince = null;
  public usStates = [];
  public selectedUsState = null;
  public specialCountries = {
    changeAddressNumOrder: ['gb', 'fr', 'ca', 'us'],
    showSelector: ['us', 'ca'],
    showSelectorDisplayMode: 'default',
  };

  get countriesOpts(): ICountryOpt[] {
    return this.countries.map((elem) => ({
      iso: elem.iso,
      label: elem._m_name[this.langSrv.getCurrentLang()],
    }));
  }

  get countriesPrefixOpts(): ICountryOpt[] {
    return this.countries.map((elem) => ({
      iso: elem.iso,
      prefix: elem.prefix,
      label: `${elem._m_name[this.langSrv.getCurrentLang()] as string} (${elem.prefix})`,
    }));
  }

  get isFavouriteAddress(): boolean {
    return this.addressToEdit ? this.addressToEdit.favourite || false : false;
  }

  get isChangeAddressNumOrder(): boolean {
    return this.specialCountries.changeAddressNumOrder.includes(this.addressForm.get('country').value);
  }

  get isCanada(): boolean {
    return this.addressForm.get('country').value === 'ca';
  }

  get isUSA(): boolean {
    return this.addressForm.get('country').value === 'us';
  }

  get selectedCountryZipMasks(): string[] {
    return this.countriesByIso[this.addressForm.get('country')?.value]?.zipMasks || [];
  }

  get zipFc(): UntypedFormControl {
    return this.addressForm.get('zip') as UntypedFormControl;
  }

  get canSubmit(): boolean {
    return this.isCrowdgiving || (!this.isCrowdgiving && this.addressForm.valid && !this.isInvalidZip);
  }

  constructor(
    private purchaseCoreSrv: PurchaseCoreService,
    private form: UntypedFormBuilder,
    public textSrv: TextService,
    private countrySrv: CountryService,
    private langSrv: LangService,
    private CaProvincesSrv: CaProvincesService,
    private USStatesSrv: USStatesService,
    private addressSrv: AddressService,
    private popupSrv: PopupService,
    private userSrv: UserService,
    private checkDataSrv: CheckDataService
  ) {}

  ngOnInit(): void {
    void this.getData();
    void this.zipInputValueChangesSubscribe();
  }

  ngOnDestroy(): void {
    this.zipControlSubscription.unsubscribe();
  }

  private checkForSpecialCounties(): void {
    const countryIso = this.addressForm.get('country').value;

    if (this.specialCountries.showSelector.includes(countryIso)) {
      this.specialCountries.showSelectorDisplayMode = countryIso;
      if (countryIso === 'us') {
        this.selectUsState(this.addressToEdit.province);
      } else if (countryIso === 'ca') {
        this.selectCaProvince(this.addressToEdit.province);
      }
    }
  }

  async getData(): Promise<void> {
    this.purchaseCoreSrv.common.setInnerLoader(true, true);
    this.countries = await this.countrySrv.get();
    this.caProvinces = (await this.CaProvincesSrv.get()).map((elem) => elem.name).sort((a, b) => (a > b ? 1 : -1));
    this.usStates = (await this.USStatesSrv.get()).map((elem) => elem.name).sort((a, b) => (a > b ? 1 : -1));
    if (!this.addressToEdit) {
      const currentCountryIso = this.countrySrv.getCountry();

      if (this.specialCountries.showSelector.includes(currentCountryIso)) {
        this.specialCountries.showSelectorDisplayMode = currentCountryIso;
      }
      this.addressForm.get('country').setValue(this.countrySrv.getCountry());
      const matchCountry = this.countries.find((elem) => elem.iso === currentCountryIso);

      this.addressForm
        .get('phone')
        .get('prefix')
        .setValue(matchCountry ? matchCountry.prefix : matchCountry);
    }
    this.purchaseCoreSrv.common.setInnerLoader(false, false);
  }

  zipInputValueChangesSubscribe(): void {
    this.zipControlSubscription = this.zipFc?.valueChanges.subscribe((val) => {
      this.onZipInputValueChanges(val);
    });
  }

  setCountryValue(params: { iso: string; prefix?: string }): void {
    this.addressForm.get('country').setValue(params.iso);
    this.zipFc.setValue('');

    if (!this.specialCountries.showSelector.includes(this.addressForm.get('country').value)) {
      this.specialCountries.showSelectorDisplayMode = 'default';
      this.selectedUsState = null;
      this.selectedCaProvince = null;
    } else {
      this.specialCountries.showSelectorDisplayMode = this.addressForm.get('country').value;
    }
  }

  setCountryPrefixValue(params: { iso: string; prefix?: string }): void {
    this.addressForm.get('phone').get('prefix').setValue(params.prefix);
  }

  onFavAddressCheckboxChange(val: boolean): void {
    this.addressForm.get('favourite').setValue(val);
  }

  onGoBackClick(): void {
    this.goBack.emit();
  }

  selectCaProvince(val: string): void {
    this.selectedCaProvince = val;
    this.selectedUsState = null;
  }

  selectUsState(val: string): void {
    this.selectedUsState = val;
    this.selectedCaProvince = null;
  }

  private onZipInputValueChanges(value: string): void {
    this.isInvalidZip = this.checkDataSrv.isInvalidZip(
      this.purchaseCoreSrv.store.countriesByIso,
      this.addressForm.get('country')?.value,
      value
    );
  }

  public onSubmitClick(): void {
    if (this.addressForm.valid) {
      this.purchaseCoreSrv.common.setInnerLoader(true, true);
      const newAddress = { ...this.addressToEdit, ...this.addressForm.value };

      newAddress.province = this.selectedCaProvince || this.selectedUsState || this.addressForm.value.city;
      void this.addressValidation(newAddress);
    }
  }

  private async addressValidation(address: IAddress): Promise<void> {
    try {
      const validation = await this.addressSrv.validate(address);

      if (validation.status !== 'registered') {
        if (validation.status === 'validated') {
          await this.addressSrv.sendHash(address, 'SOFT_VALIDATION_USER');
          await this.processAddress(address);
        } else {
          const valAddress = { address, checkAddress: validation.address, status: validation.status };

          this.purchaseCoreSrv.common.setInnerLoader(false, false);
          this.popupSrv.open(AddressPopupValidatorComponent, { data: valAddress }).onClose.subscribe(async (result) => {
            if (result) {
              this.purchaseCoreSrv.common.setInnerLoader(true, true);
              await this.processAddress(result.sugg || address);
            }
          });
        }
      } else {
        await this.processAddress(address);
      }
    } catch (error) {
      try {
        await this.processAddress(address);
        this.purchaseCoreSrv.common.logError(error);
      } catch (catchErr) {
        this.purchaseCoreSrv.common.logError(catchErr);
      }
    }
  }

  private async processAddress(address: IAddress): Promise<void> {
    if (!this.canGoBack) {
      address.favourite = true;
    }

    if (this.addressToEdit) {
      await this.editAddressHandler(address);
    } else {
      await this.addAddressHandler(address);
    }
  }

  private async editAddressHandler(address: IAddress): Promise<void> {
    try {
      const updatedAddress = await this.userSrv.editAddressById(this.addressToEdit.id as string, address);

      this.submitForm.emit(updatedAddress);
    } catch (err) {
      this.purchaseCoreSrv.common.setInnerLoader(false, false);

      this.popupSrv.open(StatusPopupComponent, {
        data: {
          err: true,
          msgError: this.textSrv.getText('Error trying to edit address'),
        },
      });

      throw new PurchaseError({
        name: 'ADDRESS_ERROR',
        message: 'Edit address error',
        cause: err,
      });
    }
  }

  private async addAddressHandler(address: IAddress): Promise<void> {
    try {
      const res: { addresses: IAddress[]; result: string } = await this.userSrv.addAddress(address);

      this.submitForm.emit(res.addresses[address.favourite ? 0 : res.addresses.length - 1]);
    } catch (err) {
      this.purchaseCoreSrv.common.setInnerLoader(false, false);

      this.popupSrv.open(StatusPopupComponent, {
        data: {
          err: true,
          msgError: this.textSrv.getText('Error trying to add address'),
        },
      });

      throw new PurchaseError({
        name: 'ADDRESS_ERROR',
        message: 'Add address error',
        cause: err,
      });
    }
  }

  private buildForm(): UntypedFormGroup {
    return this.form.group({
      country: [null, Validators.required],
      name: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      surnames: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      street: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      number: ['', Validators.compose([Validators.required, Validators.maxLength(10)])],
      details: ['', Validators.maxLength(100)],
      zip: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(10)])],
      city: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      phone: this.form.group({
        prefix: [null, Validators.required],
        number: [
          '',
          Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(12), Validators.pattern('^[0-9]+$')]),
        ],
      }),
      favourite: [false],
    });
  }
}
