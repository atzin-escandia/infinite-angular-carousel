import {Pipe, PipeTransform} from '@angular/core';
import {formatCurrency, getCurrencySymbol} from '@angular/common';
import {CountryService} from '../../services/country/country.service';
import {ICountry} from '../../interfaces/country.interface';
import {environment} from '../../../environments/environment';

@Pipe({
  name: 'currency'
})
export class CFCurrencyPipe implements PipeTransform {
  constructor(private countrySrv: CountryService) {
  }

  transform(value: number, currency: string = ''): string | null {
    const fullCountry: ICountry = this.countrySrv.getCurrentCountry();

    const symbol = getCurrencySymbol(currency ? currency : fullCountry.currency, 'narrow');

    try {
      return formatCurrency(
        value,
        fullCountry.locale,
        symbol,
        currency ? currency : fullCountry.currency
      );
    } catch (error) {
      if (!environment.production) {
        console.log('CFCurrencyPipe erro fallback with "de"');
      }

      return formatCurrency(
        value,
        'de',
        symbol,
        currency ? currency : fullCountry.currency
      );
    }
  }
}
