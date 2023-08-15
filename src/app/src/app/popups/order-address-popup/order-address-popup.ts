import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PopupsInterface } from '../popups.interface';
import {
  TextService,
  UtilsService,
  OrdersService,
  UserService,
  CheckDataService,
  CountryService,
  SubscriptionService,
} from '../../services';
import { PopupsRef } from '../popups.ref';
import { AddressService } from '../../services/adress';
import { AddressPopupValidatorComponent } from '../address-validator';
import { PopupService } from '../../services/popup';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IAddress } from '../../interfaces';
import { GenericPopupComponent } from '../generic-popup';

@Component({
  selector: 'order-address-popup',
  templateUrl: './order-address-popup.html',
  styleUrls: ['./order-address-popup.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrderAddressPopupComponent implements OnInit {
  public user: any;
  public order: any;
  public orderId: string;
  public countriesByIso: any;
  public chosenAddress: any;
  public address: any;
  public showAddress = true;
  public addAddress = false;
  public editAddress = false;
  public editingShipment = false;
  public addressChanged: any;
  public returnAddres = false;
  public maxMask = 0;
  public zipErr: any;
  public validatorAddress: IAddress;

  public addressSelected: number;

  public onClose: any;

  public newUser: any = {
    email: '',
    password: '',
    repassword: '',
    privacy: false,
  };

  public errorInUser: any = {
    email: false,

    passLong: false,
    passNumber: false,
    passLetter: false,
    passSpace: false,
    repass: false,

    tos: false,
  };

  public errorInAddress: any = {
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

  constructor(
    public config: PopupsInterface,
    public popup: PopupsRef,
    public textSrv: TextService,
    public userSrv: UserService,
    public utilsSrv: UtilsService,
    public ordersSrv: OrdersService,
    public subscriptionSrv: SubscriptionService,
    public checkSrv: CheckDataService,
    public addressSrv: AddressService,
    public popupSrv: PopupService,
    public countrySrv: CountryService
  ) {}

  async ngOnInit(): Promise<any> {
    this.user = this.config.data.user;
    this.order = this.config.data.order;
    this.orderId = this.order._id || this.order.id;
    this.countriesByIso = this.config.data?.countriesByIso || await this.countrySrv.getCountriesByISO();

    if (this.user && this.user.addresses && this.user.addresses.length > 0) {
      this.user.addresses = this.user.addresses.filter((address) => address.country === this.order.shipment.address.country);
    }

    if (this.config.data.returnAddres) {
      this.returnAddres = this.config.data.returnAddres;
      if (!this.user || !this.user.addresses || this.user.addresses.length === 0) {
        this.toggleEditAdd({ add: true });
      }
    } else {
      this.chosenAddress = this.order.shipment.address;
      if (this.user.addresses && this.user.addresses.length > 0) {
        this.user.addresses.map((address: string, i: number) => {
          if (JSON.stringify(address) === JSON.stringify(this.chosenAddress)) {
            this.addressSelected = i;
          }
        });
      }
    }
  }

  public toggleEditAdd(e: any): void {
    this.showAddress = false;
    this.editingShipment = e.shipment;

    if (e.add) {
      this.addAddress = true;
      this.address = this.utilsSrv.addressTemp();
      this.editAddress = false;
    } else {
      this.addAddress = false;
      this.address = this.order.shipment.address;
      this.editAddress = true;
    }
  }

  public newChosenAddress(address: any, index: number): void {
    this.addressChanged = address;
    this.addressSelected = index;
  }

  public dismissAdd(): void {
    this.showAddress = true;
    this.addAddress = false;
  }

  public async changeOrderAddress(): Promise<void> {
    if (this.returnAddres) {
      const result: any = {
        address: this.addressChanged,
      };

      this.onClose(result);
    } else {
      try {
        const updated = await this.ordersSrv.changeAddress(this.orderId, this.addressChanged);

        if (updated) {
          this.onClose('notifications.address-successfully-changed.text-info');
        }
      } catch (err) {
        this.popupSrv.open(GenericPopupComponent, {
          data: {
            msg: err.msg,
          },
        });
      }
    }
    this.onClose();
  }

  public async changeSubscriptionShipment(): Promise<void> {
    if (this.returnAddres) {
      const result: any = {
        address: this.addressChanged,
      };

      this.onClose(result);
    } else {
      try {
        const updated = await this.subscriptionSrv.changeSubscriptionShipment(this.order._id, this.addressChanged);

        if (updated) {
          this.onClose('notifications.address-successfully-changed.text-info');
        }
      } catch (err) {
        this.popupSrv.open(GenericPopupComponent, {
          data: {
            msg: err.msg,
          },
        });
      }
    }
    this.onClose();
  }

  /**
   * saves changes in addresses (add and edit)
   */
  public async saveAddress(): Promise<any> {
    this.checkErorrs();

    if (!this.checkSrv.formValidation(this.errorInAddress, true)) {
      return;
    } else {
      await this.addressValidation();
    }
  }

  public async processAddress(address: IAddress): Promise<any> {
    if (this.returnAddres) {
      const result: any = {
        address,
      };

      if (!this.user) {
        this.checkErorrs();
        if (this.checkSrv.formValidation(this.errorInAddress, true) && this.checkSrv.formValidation(this.errorInUser, true)) {
          result.email = this.newUser.email.toLowerCase();
          result.password = this.newUser.password;
          this.onClose(result);
        }
      } else if (!this.editAddress && this.checkSrv.formValidation(this.errorInAddress, true)) {
        await this.userSrv.addAddress(address);
        this.user = await this.userSrv.get(true);
        this.onClose(result);
      }
    } else if (this.editingShipment) {
      await this.ordersSrv.changeAddress(this.orderId, address);
      this.onClose('Address change success');
    } else if (!this.editAddress) {
      if (this.checkSrv.formValidation(this.errorInAddress, true)) {
        this.dismissAdd();
        const addressData = await this.userSrv.addAddress(address);
        const newAddress = addressData.addresses[addressData.addresses.length - 1];

        await this.ordersSrv.changeAddress(this.orderId, newAddress);
        this.user = await this.userSrv.get(true);
        this.onClose('Address change success');
      }
    }
  }

  public async addressValidation(): Promise<any> {
    let popup: any = '';
    const addressFormat: any = {
      city: this.address.city,
      country: this.address.country,
      number: this.address.number,
      street: this.address.street,
      zip: this.address.zip,
      province: this.address.province ? this.address.province : this.address.city,
    };

    const validation = await this.addressSrv.validate(addressFormat);

    if (validation.status !== 'registered') {
      if (validation.status === 'validated') {
        await this.addressSrv.sendHash(addressFormat, 'SOFT_VALIDATION_USER');
        await this.processAddress(this.address);
        this.addAddress = false;
        this.editAddress = false;
        this.validatorAddress = this.address;
      } else {
        this.address.province = this.address.province ? this.address.province : this.address.city;
        const valAddress = { address: this.address, checkAddress: validation.address, status: validation.status };

        popup = this.popupSrv.open(AddressPopupValidatorComponent, { data: valAddress, fromPopUp: true });
        const unsub = new Subject<void>();

        popup.onClose.pipe(takeUntil(unsub)).subscribe(async (result) => {
          unsub.next();
          if (result) {
            if (result.sugg) {
              this.validatorAddress = result.sugg;
              await this.processAddress(this.validatorAddress);
              this.dismissAdd();
            } else {
              await this.processAddress(this.address);
              this.dismissAdd();
            }
          }
          unsub.complete();
        });
      }
    } else {
      await this.processAddress(this.address);
      this.addAddress = false;
      this.editAddress = false;
      this.validatorAddress = this.address;
    }
  }

  public checkErorrs(): void {
    for (const key in this.errorInUser) {
      if (this.errorInUser[key]) {
        if (key === 'email') {
          this.errorInUser.email = !this.checkSrv.emailIsValid(this.newUser.email);
        }

        if (key === 'tos') {
          this.errorInUser.tos = !this.newUser.privacy;
        }

        if (key.indexOf('pass') !== -1) {
          this.errorInUser[key] = !this.checkSrv.passwordIsValid(key, this.newUser.password, this.newUser.repassword);
        }
      }
    }

    for (const key in this.errorInAddress) {
      if (key !== 'validZip' && key !== 'lengthZip') {
        this.checkSrv.manageInput(this.address, this.errorInAddress, this.countriesByIso, this.maxMask, key, false);
      } else if (key === 'validZip') {
        this.errorInAddress.validZip = !this.checkSrv.hasValidPrefixZip(
          this.countriesByIso[this.address.country],
          this.address.zip,
          this.zipErr
        );
      } else if (key === 'lengthZip') {
        this.errorInAddress.lengthZip = !this.checkSrv.hasValidMaskLenght(
          this.countriesByIso[this.address.country],
          this.address.zip,
          this.maxMask,
          this.zipErr
        );
      }
    }
  }
}
