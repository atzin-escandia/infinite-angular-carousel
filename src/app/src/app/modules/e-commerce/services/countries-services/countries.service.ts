import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { ICountryIso } from '@app/interfaces';
import { CountryService } from '@app/services';
import { TransferStateService } from '@app/services/transfer-state';
import { DELIVERY_COUNTRY_DTO } from '../../constant/states.constant';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  constructor(private countrySrv: CountryService, private transferStateSrv: TransferStateService) {}

  getCountries(): Observable<ICountryIso> {
    return from(this.countrySrv.getCountriesByISO());
  }

  setIsoCountry(countries: ICountryIso, isoCode: string): void {
    this.transferStateSrv.set(DELIVERY_COUNTRY_DTO, countries[isoCode]);
  }

  getDeliveryCountry(): ICountryIso {
    return this.transferStateSrv.get(DELIVERY_COUNTRY_DTO);
  }
}
