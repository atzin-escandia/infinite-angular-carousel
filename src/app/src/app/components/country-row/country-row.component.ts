import { Component, OnInit, Injector, Input, Output, EventEmitter, OnDestroy } from '@angular/core';

import { BaseComponent } from '../base';

import { CountryService, CartsService } from '@app/services';
import { Subscription } from 'rxjs';
import { ICountry } from '@app/interfaces';

@Component({
  selector: 'country-row',
  templateUrl: './country-row.component.html',
  styleUrls: ['./country-row.component.scss'],
})
export class CountryRowComponent extends BaseComponent implements OnInit, OnDestroy {
  @Output() countryChange: any = new EventEmitter();

  public country;
  public countrySubscription: Subscription;
  @Input() public products: any;
  @Input() public availableCountries: any;

  constructor(public injector: Injector, private countrySrv: CountryService, private cartSrv: CartsService) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    this.country = await this.countrySrv.getCountryByIso();

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.countrySubscription = this.countrySrv.countryChange().subscribe(async (country) => {
      this.country = await this.countrySrv.getCountryByIso(country);
    });
  }

  /**
   * Open country selector popup
   */
  public async openCountrySelector(): Promise<void> {
    let countries: { [iso: string]: ICountry };

    if (this.products?.length) {
      const countriesOnCart = this.cartSrv.getCountriesOnCart(this.products);

      countries = await this.countrySrv.getCountriesByISOFilter(countriesOnCart);
    } else if (this.availableCountries) {
      countries = await this.countrySrv.getCountriesByISOFilter(this.availableCountries);
    } else {
      countries = await this.countrySrv.getCountriesByISO();
    }

    this.popoverSrv.open('LocationLangComponent', 'header-location', {
      inputs: {
        countries: Object.keys(countries).map((key) => countries[key]),
      },
      outputs: {
        onClose: (result) => {
          if (result) {
            this.countryChange.emit(this.country.iso);
          }
          this.popoverSrv.close('LocationLangComponent');
        },
      },
    });
  }

  ngOnDestroy(): void {
    if (this.countrySubscription) {
      this.countrySubscription.unsubscribe();
    }
  }
}
