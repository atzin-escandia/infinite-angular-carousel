import {Component, OnInit} from '@angular/core';
import {PopupsInterface} from '../popups.interface';
import {PopupsRef} from '../popups.ref';
import {TextService, UserService, UtilsService, DomService, CheckDataService, CountryService} from '../../services';
import {IAddress} from '../../interfaces';

@Component({
  selector: 'add-info',
  templateUrl: './add-info.html',
  styleUrls: ['./add-info.scss']
})
export class AddInfoComponent implements OnInit {
  public isLogged: boolean;
  public editAddress = false;
  public addAddress = false;
  public canStart = false;
  public address: IAddress;
  public idAddress: number;
  public addPaymentType: string;
  public currentTab: number;
  public countriesByIso: any;
  public maxMask = 0;
  public tabsTexts: any = [this.textSrv.getText('Add new stripe card'), this.textSrv.getText('Add new stripe sepa')];
  public onClose: any;
  public errorIn: any = {
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
    city: false
  };

  constructor(
    public config: PopupsInterface,
    public popup: PopupsRef,
    private textSrv: TextService,
    private userSrv: UserService,
    public utilsSrv: UtilsService,
    private domSrv: DomService,
    public checkSrv: CheckDataService,
    public countrySrv: CountryService
  ) { }

  async ngOnInit(): Promise<void> {
    const params = this.config.data;

    this.isLogged = params.isLogged ? params.isLogged : true;

    this.editAddress = params.editAddress;
    this.addAddress = params.addAddress;
    this.addPaymentType = params.addPaymentType;
    this.currentTab = this.addPaymentType === 'card' ? 0 : 1;

    if (this.editAddress || this.addAddress) {
      this.countriesByIso = await this.countrySrv.getCountriesByISO();

      if (this.addAddress) {
        this.address = this.utilsSrv.addressTemp();
      } else {
        this.address = Object.assign({}, params.address);
        this.idAddress = params.id;

        // Property exits, inferface complains
        delete this.address.id;
      }

      if (!this.address.country) {
        const country = this.countrySrv.getCountry();

        if (country) {
          this.address.country = country;
          this.address.phone.prefix = this.countriesByIso[country].prefix;
        }
      }
    }

    this.canStart = true;
  }

  /**
   * Save address
   */
  public async saveAddAddress(): Promise<void> {
    this.checkErorrs();

    if (!this.checkSrv.formValidation(this.errorIn, true)) {
      return;
    }

    const addressData = await this.userSrv.addAddress(this.address);

    const addressAdded = addressData.addresses[addressData.addresses.length - 1];

    addressAdded.id = addressData.addresses.length - 1;

    this.onClose();
    this.config.data.adressAdded(addressAdded);
  }

  public checkErorrs(): void {
    let isError: boolean;

    for (const key in this.errorIn) {
      if (key !== 'validZip' && key !== 'lengthZip') {
        this.checkSrv.manageInput(this.address, this.errorIn, this.countriesByIso, this.maxMask, key, false);
      } else if (key === 'validZip' && this.address.country) {
        this.errorIn.validZip = !this.checkSrv.hasValidPrefixZip(this.countriesByIso[this.address.country], this.address.zip, isError);
      } else if (key === 'lengthZip' && this.address.country) {
        this.errorIn.lengthZip = !this.checkSrv.hasValidMaskLenght(
          this.countriesByIso[this.address.country],
          this.address.zip,
          this.maxMask,
          isError
        );
      }
    }

    if (!this.checkSrv.hasValidPrefixZip(this.countriesByIso[this.address.country], this.address.zip, isError)) {
      isError = false;
    }
  }

  /**
   * Edit address
   */
  public async saveEditAddress(): Promise<void> {
    this.checkErorrs();

    if (!this.checkSrv.formValidation(this.errorIn, true)) {
      return;
    }

    const addressData = await this.userSrv.editAddress(this.address, this.idAddress);

    const addressEdited = addressData.addresses[this.idAddress];

    addressEdited.id = this.idAddress;

    this.onClose();
    this.domSrv.scrollToTop();
    this.config.data.adressEdited(addressEdited);
  }

  /**
   * Add new payment
   */
  public paymentAdded(newPayment: any): void {
    this.onClose(null, () => {
      this.config.data.callbackAdd(newPayment);
    });
  }

  public changeMethod(id: number): void {
    this.currentTab = id;
    this.addPaymentType = id === 0 ? 'card' : 'sepa';
  }
}
