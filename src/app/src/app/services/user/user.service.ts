import { Injectable, Injector } from '@angular/core';
import { BaseService } from '../base';
import { UserResource } from '../../resources';
import { StorageService } from '../storage';
import { Subject, Observable } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';
import { LoggerService } from '../logger';
import { IAddress } from '../../interfaces';
import { PaymentMethodsActionResInterface } from '../../interfaces';
import { AuthService } from '../auth';
import { CurrencyType } from '../../constants/app.constants';
import { ICredit } from '../../interfaces/credit.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService {
  private user = new Subject<any>();

  constructor(
    private userRsc: UserResource,
    private storageSrv: StorageService,
    public injector: Injector,
    private deviceService: DeviceDetectorService,
    private logger: LoggerService,
    private authSrv: AuthService
  ) {
    super(injector);
  }

  /**
   * Return counter language on Observable
   */
  public getCurrent(): Observable<any> {
    return this.user.asObservable();
  }

  /**
   * Get user info
   */
  public async get(force?: boolean): Promise<any> {
    if (this.authSrv.isLogged()) {
      const userLogged = this.authSrv.getCurrentUser();
      const user = force ? await this.authSrv.getMe() : userLogged;

      if (user) {
        if (force) {
          this.logger.createSessionId(false, user);
        }
        this.user.next(user);
      }

      return user;
    } else {
      throw new Error('USER:NOT_LOGGED');
    }
  }

  public setOnStorage(user: any): void {
    this.authSrv.setUserOnStorage(user);
  }

  public getCurrentUser(): any {
    return this.authSrv.getCurrentUser();
  }

  public toggleAutoLogin(status: boolean): void {
    this.authSrv.toggleAutoLogin(status);
  }

  public isLogged(): boolean {
    return this.authSrv.isLogged();
  }

  public getCredits(currency: CurrencyType): Promise<ICredit> {
    return this.userRsc.getCredits(currency);
  }

  public isAutoLogged(): boolean {
    return this.authSrv.isAutoLogged();
  }

  public getDevice(userId: string): string {
    const deviceInfo = this.deviceService.getDeviceInfo();

    return btoa(deviceInfo.userAgent + '_$_' + userId);
  }

  public async setDevice(userId: string): Promise<any> {
    await this.userRsc.setDevice(userId, this.getDevice(userId));
  }

  /**
   * Get user ups
   */
  public async getUserUps(status?: string): Promise<any> {
    let userUps = await this.userRsc.getUserUps(status);

    userUps = this.modelize(userUps);

    return userUps;
  }

  /**
   * Get use payment methods
   */
  public async getPaymentMethods(): Promise<any> {
    const user = await this.get(true);

    return user.paymentMethods || [];
  }

  /**
   * Add credit card
   */
  public async addCreditCard(paymentMethodId: any, country: string): Promise<any> {
    const body = {
      paymentMethod: {
        id: paymentMethodId,
        type: 'card',
      },
      country,
    };

    return await this.userRsc.addPaymentMethod(body);
  }

  /**
   * Remove payment method
   */
  public async removePaymentMethod(paymentMethod: any): Promise<PaymentMethodsActionResInterface> {
    const body = { paymentMethod };

    return await this.userRsc.deletePaymentMethod(body);
  }

  /**
   * Add SEPA
   */
  public async addSEPA(sepa: any): Promise<any> {
    const params = {
      paymentMethod: {
        source: sepa.source,
        type: 'sepa',
      },
    };

    return await this.userRsc.addPaymentMethod(params);
  }

  public async addPayPal(paypal: any, country: string): Promise<any> {
    const params = {
      paymentMethod: {
        id: paypal.id,
        type: 'paypal',
      },
      country,
    };

    return await this.userRsc.addPaymentMethod(params);
  }

  /**
   * Set default payment mehtod
   */
  public async setDefaultPaymentMethod(paymentMethodId: string): Promise<any> {
    const params = {
      paymentMethodId,
    };

    return await this.userRsc.setDefaultPaymentMethod(params);
  }

  /**
   * Get use address
   */
  public async getAddresses(): Promise<IAddress[]> {
    const user = await this.get(true);

    return user.addresses || [];
  }

  /**
   * Get if is a social account
   */
  public async getIsSocial(id: string): Promise<IAddress[]> {
    return await this.userRsc.getIsSocial(id);
  }
  /**
   * Add address
   */
  public async addAddress(address: IAddress): Promise<any> {
    if (!address.province) {
      address.province = address.city;
    }
    if (Object.prototype.hasOwnProperty.call(address, 'addressId')) {
      delete address.addressId;
    }
    const currentAddresses = await this.getAddresses();

    if (address.favourite) {
      for (const currentAddress of currentAddresses) {
        currentAddress.favourite = false;
      }
    }
    const newAddresses: IAddress[] = currentAddresses.concat(address);

    newAddresses.sort((a, b) => (a.favourite && !b.favourite ? -1 : 1));

    return await this.userRsc.handleAddresses(newAddresses);
  }

  /**
   * Remove address
   */
  public async removeAddress(addresses: IAddress[]): Promise<any> {
    return await this.userRsc.handleAddresses(addresses);
  }

  /**
   * Edit address
   */
  public async editAddress(address: IAddress, idx: number): Promise<any> {
    const currentAddresses = await this.getAddresses();
    const editedAddresses = currentAddresses.slice(0);

    if (Object.prototype.hasOwnProperty.call(address, 'addressId')) {
      delete address.addressId;
    }
    if (address.favourite) {
      for (const editedAddress of editedAddresses) {
        editedAddress.favourite = false;
      }
    }
    address.edited = true;
    editedAddresses[idx] = address;
    editedAddresses.sort((a, b) => (a.favourite && !b.favourite ? -1 : 1));

    return await this.userRsc.handleAddresses(editedAddresses);
  }

  /**
   * Edit address by id
   */
  public async editAddressById(addressId: string, address: IAddress): Promise<IAddress> {
    const res = await this.userRsc.editAddressesById(addressId, address);

    return res.address;
  }

  /**
   * Set as default address
   */
  public async setAsDefaultAddress(addresses: IAddress[]): Promise<any> {
    return await this.userRsc.handleAddresses(addresses);
  }

  /**
   * Changes user information function
   */
  public async updateUserInfo(newInfo: string): Promise<any> {
    const update = await this.userRsc.update(newInfo);

    await this.get(true);

    return update;
  }

  /**
   * Update subscription newsletter subscription categories
   */
  public async updateUserNewsletterCategories(id: string, body: any): Promise<any> {
    const update = await this.userRsc.updateNewsletterCategories(id, body);

    await this.get(true);

    return update;
  }
  /**
   * Update subscription newsletter subscription user
   */
  public async updateUserNewsletterSubscription(id: string): Promise<any> {
    const update = await this.userRsc.updateNewsletterSubscription(id);

    await this.get(true);

    return update;
  }

  /**
   * Delete user function
   */
  public async deleteUser(token: string): Promise<any> {
    return await this.userRsc.deleteUser(token);
  }

  /**
   * Delete user function
   */
  public async updateOver18(id: string, value: boolean): Promise<any> {
    return await this.userRsc.updateOver18(id, value);
  }

  /**
   * Delete user function
   */
  public async getNewsletterPreferences(token: string, isMktCloud: boolean): Promise<any> {
    return await this.userRsc.getNewsletterPreferences(token, isMktCloud);
  }

  /**
   * Delete user function
   */
  public async updateNewsletterPreferences(token: string, preferences: any, isMktCloud: boolean): Promise<any> {
    return await this.userRsc.updateNewsletterPreferences(token, preferences, isMktCloud);
  }

  /**
   * Makes user investments
   */
  public async invest(id: string, amount: number): Promise<any> {
    return await this.userRsc.invest(id, amount);
  }

  /**
   * Confirm authorization to ideal payment
   */
  public async confirmIdealAuth(
    profile_id: string,
    set_fav: string,
    redirect_status: string,
    setup_intent: string,
    setup_intent_client_secret: string
  ): Promise<any> {
    return await this.userRsc.confirmIdealAuth(profile_id, set_fav, redirect_status, setup_intent, setup_intent_client_secret);
  }

  /**
   * Confirm authorization to PayPal payment
   */
  public async confirmPayPalAuth(
    profile_id: string,
    set_fav: string,
    redirect_status: string,
    setup_intent: string,
    setup_intent_client_secret: string
  ): Promise<any> {
    return await this.userRsc.confirmPayPalAuth(profile_id, set_fav, redirect_status, setup_intent, setup_intent_client_secret);
  }

  public checkAccountDeletion(email: string): Promise<{ canDeleteAccount: boolean; reasons: string[] }> {
    return this.userRsc.checkAccountDeletion(email);
  }

  public sendMailToDeleteAccount(userId: string): Promise<void> {
    return this.userRsc.sendMailToDeleteAccount(userId);
  }
}
