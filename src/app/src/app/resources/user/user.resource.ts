import {Injectable} from '@angular/core';
import {BaseResource} from '../base';
import {ApiResource} from '../api';
import {StorageService} from '../../services/storage';
import {PaymentMethodsActionResInterface} from '../../interfaces/payment-method.interface';
import {IAddress} from '../../interfaces';
import {CurrencyType} from '../../constants/app.constants';
import {ICredit} from '../../interfaces/credit.interface';

@Injectable({
  providedIn: 'root'
})
export class UserResource extends BaseResource {
  constructor(public apiRsc: ApiResource, private storageSrv: StorageService) {
    super(apiRsc);
  }

  public getCredits(currency: CurrencyType): Promise<ICredit> {
    const body = { currency };

    return this.apiRsc.post({service: 'crowdfarmers/me/credits', body});
  }

  public setDevice(userId: string, deviceId: string): any {
    const body = {
      id: deviceId,
      type: 'BROWSER'
    };

    return this.apiRsc.put({service: 'users/' + userId + '/devices', body});
  }

  /**
   * Get user ups from servers
   */
  public getUserUps(status: string = 'on-season'): Promise<any> {
    const params = {
      query: status
    };

    return this.apiRsc.get({service: 'crowdfarmers/ups', version: 'v2', params, loader: true});
  }

  /**
   * Handle address service
   */
  public handleAddresses(addresses: any): Promise<any> {
    return this.apiRsc.put({service: 'crowdfarmers/addresses', body: {addresses}, loader: true});
  }

  /**
   * Edit user address by id
   */
  public editAddressesById(addressId: string, address: IAddress): Promise<any> {
    return this.apiRsc.put({service: `crowdfarmers/address/${addressId}`, body: { address }, loader: true});
  }

  /**
   * Set default payment mehtod
   */
  public setDefaultPaymentMethod(body: any): Promise<any> {
    return this.apiRsc.post({service: 'crowdfarmers/payment-methods/stripe/favourite', body, loader: true});
  }

  /**
   * Add payment mehtod
   */
  public addPaymentMethod(body: any): Promise<any> {
    return this.apiRsc.post({service: 'crowdfarmers/payment-methods/stripe', body, loader: true, version: 'v2'});
  }

  /**
   * Delete payment mehtod
   */
  public deletePaymentMethod(body: any): Promise<PaymentMethodsActionResInterface> {
    return this.apiRsc.delete({service: 'crowdfarmers/payment-methods/stripe', body, loader: true});
  }

  /**
   * Update over18
   */
  public updateOver18(id: string, value: boolean): Promise<any> {
    return this.apiRsc.put({service: 'crowdfarmers/' + id + '/over18', body: {value}});
  }

  /**
   * Get if is a social account
   */
  public getIsSocial(id: string): Promise<any> {
    return this.apiRsc.get({service: 'crowdfarmers/' + id + '/social'});
  }

  /**
   * Updates user info against server
   */
  public update(body: any): Promise<any> {
    return this.apiRsc.put({service: 'crowdfarmers/me', body, loader: true});
  }

  /**
   * Updates user newsletter categories
   */
  public updateNewsletterCategories(id: string, body: any): Promise<any> {
    return this.apiRsc.put({service: 'crowdfarmers/' + id + '/newsletter/categories', body, loader: true});
  }

  /**
   * Updates user newsletter subscription
   */
  public updateNewsletterSubscription(id: string): Promise<any> {
    return this.apiRsc.put({service:  'crowdfarmers/' + id + '/newsletter', loader: true});
  }

  /**
   * Orders user deletion
   */
  public deleteUser(token: string): Promise<any> {
    return this.apiRsc.delete({service: 'crowdfarmers/terminate/' + token});
  }

  /**
   * get soft users's newslwtter preferences
   */
  public getNewsletterPreferences(token: string, isMktCloud: boolean): Promise<any> {
    return this.apiRsc.get({
      service: 'crowdfarmers/emails/newsletterCats/' + (isMktCloud ? 'mkt-cloud/' : 'capi/') + token
    });
  }

  /**
   * Update soft users' newsletter preferences
   */
  public updateNewsletterPreferences(token: string, preferences: string, isMktCloud: boolean): Promise<any> {
    return this.apiRsc.post({
      service: 'crowdfarmers/emails/newsletterCats/' + token,
      body: {preferences, isMktCloud}
    });
  }

  /**
   * makes call to save users investment
   */
  public invest(id: string, amount: number): Promise<any> {
    return this.apiRsc.put({service: 'crowdfarmers/' + id + '/invest', body: {amount}});
  }

  // eslint-disable-next-line max-len
  public confirmIdealAuth(profile_id: string, set_fav: string, redirect_status: string, setup_intent: string, setup_intent_client_secret: string): Promise<any> {
    // eslint-disable-next-line max-len
    return this.apiRsc.get({service: `payments/ideal/confirm?profile_id=${profile_id}&set_fav=${set_fav}&redirect_status=${redirect_status}&setup_intent=${setup_intent}&setup_intent_client_secret=${setup_intent_client_secret}`});
  }

  // eslint-disable-next-line max-len
  public confirmPayPalAuth(profile_id: string, set_fav: string, redirect_status: string, setup_intent: string, setup_intent_client_secret: string): Promise<any> {
    // eslint-disable-next-line max-len
    return this.apiRsc.get({service: `payments/paypal/confirm?profile_id=${profile_id}&set_fav=${set_fav}&redirect_status=${redirect_status}&setup_intent=${setup_intent}&setup_intent_client_secret=${setup_intent_client_secret}`});
  }

  public checkAccountDeletion(email: string): Promise<{canDeleteAccount: boolean; reasons: string[]}> {
    return this.apiRsc.get({service: `crowdfarmers/check-account-deletion?email=${email}`});
  }

  public sendMailToDeleteAccount(userId: string): Promise<void> {
    return this.apiRsc.delete({service: `crowdfarmers/${userId}/terminate`});
  }
}
