import {Injectable} from '@angular/core';
import {HttpClient, HttpBackend} from '@angular/common/http';
import {BaseResource} from '../base';
import {ApiResource} from '../api';
import {IStripeErrorsApiRes} from '../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class StripeResource extends BaseResource {
  constructor(public apiRsc: ApiResource, private http: HttpClient, private handler: HttpBackend) {
    super(apiRsc);
    this.http = new HttpClient(handler);
  }

  public async createSecret(paymentMethod = 'card'): Promise<any> {
      return this.apiRsc.get({service: `payments/secret/stripe/${paymentMethod}`});
  }

  public async createIntent(body: any): Promise<any> {
    return this.apiRsc.post({service: 'payments/intent/stripe', body: { ...body, platform: 'web' }});
  }

  public async confirm(body: any): Promise<{result: boolean; confirmedIntent: stripe.paymentIntents.PaymentIntent}> {
    return this.apiRsc.post({service: 'payments/intent/stripe/confirm', body});
  }

  public async confirmPaymentMethod(body: any, pm: 'paypal' | 'klarna'): Promise<{result: boolean; url: string}> {
    return this.apiRsc.post({service: `payments/intent/stripe/confirm/${pm}`, body});
  }

  public async createPaymentMethod(body: any): Promise<any> {
    return this.apiRsc.post({service: 'payments/card/stripe/token', body});
  }

  public async getStripeErrors(): Promise<IStripeErrorsApiRes> {
    return this.apiRsc.get({service: 'config?stripe-errors'});
  }

  // Could be used
  // public async updateIntent(body: any): Promise<any> {
  //   return await this.apiRsc.put({service: 'payments/intent/stripe', body});
  // }
}
