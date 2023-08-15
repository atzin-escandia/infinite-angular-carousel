/// <reference types="stripe-v3" />
import {Injectable, Injector} from '@angular/core';
import {BaseService} from '../base';
import {UtilsService} from '../utils';
import {environment} from '../../../environments/environment';
import {StripeResource} from '../../resources';
import {Observable, Subject} from 'rxjs';
import {IAddress, IStripeErrors, IStripeErrorsApiRes} from '../../interfaces';

declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class StripeService extends BaseService {
  private stripeErrors: IStripeErrors;

  public stripe;
  public loadedStripeSub = new Subject<boolean>();
  public loadingStripe = false;

  constructor(public injector: Injector, private stripeRsc: StripeResource, private utilsSrv: UtilsService) {
    super(injector);
  }

  /**
   * Init stripe service
   */
  public init(): void {
    if (typeof window.Stripe === 'undefined' && !this.loadingStripe) {
      this.loadingStripe = true;
      this.utilsSrv.loadScript({src: environment.stripe.URL, onload: this.loadSDK.bind(this)});
    }
  }
  /**
   * Load Stripe
   */
  private loadSDK(): void {
    if (typeof window.Stripe !== 'undefined') {
      this.stripe = window.Stripe(environment.stripe.code, {betas: ['paypal_pm_beta_1']});
      this.loadedStripeSub.next(true);
    }
  }

  /**
   * Get stripe object
   */
  public get(): any {
    if (!this.stripe) {
      this.init();
    }

    return this.stripe;
  }

  /**
   * Get if is loaded
   */
  public isLoaded(): boolean {
    return !!this.stripe;
  }

  /**
   * Return if stripe is ready Observable
   */
  public getStripeReady(): Observable<any> {
    return this.loadedStripeSub.asObservable();
  }

  /**
   * Client secret setup
   */
  public async getSecret(paymentMethod = 'card'): Promise<any> {
    return await this.stripeRsc.createSecret(paymentMethod);
  }

  /**
   * Client secret intent
   */
  public async getIntent(body: any): Promise<any> {
    return await this.stripeRsc.createIntent(body);
  }

  public async confirm(body: any): Promise<{result: boolean; confirmedIntent: stripe.paymentIntents.PaymentIntent}> {
    return await this.stripeRsc.confirm({id: body});
  }

  public async confirmPaymentMethod(body: any, pm: 'paypal' | 'klarna'): Promise<{result: boolean; url: string}> {
    return await this.stripeRsc.confirmPaymentMethod(body, pm);
  }

  public async createPaymentMethod(body: any): Promise <any> {
    return await this.stripeRsc.createPaymentMethod(body);
  }

  public async getPublicErrors(): Promise <IStripeErrorsApiRes> {
    return await this.stripeRsc.getStripeErrors();
  }

  public async getPublicErrorMessage(error?: stripe.Error): Promise<string> {
    if (!this.stripeErrors) {
      const { stripe } = await this.getPublicErrors();

      this.stripeErrors = stripe.errors;
    }

    const { codes, publicMessages } = this.stripeErrors;

    if (error) {
      const code = error.decline_code || error.code || error.type;

      if (code) {
        const num = codes[code] ?? 'default';

        return num === 0 ? error.message : publicMessages[num];
      }
    }

    return publicMessages.default;
  }

  /**
   * Client secret intent
   */
  // Could be used
  // public async updateIntent(body: any): Promise<any> {
  //   return await this.stripeRsc.updateIntent(body);
  // }

  toStripeAddress(address: IAddress): stripe.ShippingDetailsAddress {
    return {
      line1: address.street,
      line2: address.number,
      city: address.city,
      state: address.province,
      country: address.country,
      postal_code: address.zip,
    };
  }

  toStripeShippingDetails(address: IAddress): stripe.ShippingDetails {
    return {
      name: `${address.name} ${address.surnames}`,
      address: this.toStripeAddress(address),
    };
  }
}
