import { Injectable, Injector } from '@angular/core';
import { BaseService } from '../base';
import { PaymentMethodsResource } from '../../resources';
import { CountryService } from '../country';
import { AllowedPaymentMethodInterface, AllowedPaymentMethodName } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodsService extends BaseService {
  constructor(private paymentMethodsRsc: PaymentMethodsResource, private countrySrv: CountryService, public injector: Injector) {
    super(injector);
  }

  /**
   * Get payment method by its name
   */
  public async getByName(pmName: AllowedPaymentMethodName): Promise<AllowedPaymentMethodInterface> {
    const result = await this.paymentMethodsRsc.get({
      service: 'payment-methods/',
      version: 'v1',
      params: { query: '{ "name": "' + pmName + '"}' },
    });

    if (result.length !== 1) {
      // TODO: Catch this error
      throw new Error('The provided name does not correpond to a unique payment method');
    }

    return result[0];
  }

  async checkCountryPaymentMethodAvailability(paymentMethodName: AllowedPaymentMethodName, countryIso: string): Promise<boolean> {
    const { allowedCountries } = await this.getByName(paymentMethodName);

    if (!allowedCountries || !Array.isArray(allowedCountries) || allowedCountries.length === 0) {
      return false;
    }

    return (await this.countrySrv.getAll())
      .filter(({ _id }) => allowedCountries.includes(_id))
      .map(({ iso }) => iso)
      .includes(countryIso);
  }
}
