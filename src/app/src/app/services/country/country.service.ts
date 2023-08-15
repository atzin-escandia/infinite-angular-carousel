import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { BaseService } from '../base';
import { CountriesResource } from '../../resources';
import { registerLocaleData } from '@angular/common';
import { ICountry } from '../../interfaces';
import { StorageService } from '../storage';
import { TransferStateService } from '../transfer-state';
import { LangService } from '../lang';
import { ActivatedRoute } from '@angular/router';
import { StateService } from '../state/state.service';

@Injectable({
  providedIn: 'root',
})
export class CountryService extends BaseService {
  private country = new Subject<string>();
  private countries: any[] = [];
  private allCountries: any[] = [];
  private promises = { countries: null, allCountries: null };
  private areCountriesLoaded$ = new BehaviorSubject<boolean>(false);

  constructor(
    private countriesRsc: CountriesResource,
    private storageSrv: StorageService,
    private langSrv: LangService,
    private transferStateSrv: TransferStateService,
    private route: ActivatedRoute,
    private stateSrv: StateService,
    public injector: Injector
  ) {
    super(injector);
  }

  // Mandatory implementation
  public async init(initial?: string | null): Promise<any> {
    const result = await Promise.all([this.get(), this.getAll()]);
    const country = initial || this.getCountry(true);

    this.setCountry(country);
    this.stateSrv.setCurrentCountry(country);

    this.areCountriesLoaded$.next(true);

    return result;
  }

  /**
   * Get countries
   */
  private load(type: string): Promise<ICountry[]> {
    const fn = type === 'countries' ? 'get' : 'getAll';

    if (this.promises[type] === null) {
      // eslint-disable-next-line no-async-promise-executor
      this.promises[type] = new Promise(async (resolve, reject) => {
        try {
          if (this[type].length === 0) {
            const stateKey = type;
            let countries = this.transferStateSrv.get(stateKey);

            if (countries === null) {
              countries = await this.countriesRsc[fn]();
              this.transferStateSrv.set(stateKey, countries);
            }
            this[type] = this.modelize(countries, [], true);
          }
          resolve(this[type]);
        } catch (e) {
          reject(e);
        } finally {
          this.promises[type] = null;
        }
      });
    }

    return this.promises[type];
  }

  public get(): Promise<ICountry[]> {
    return this.load('countries');
  }

  public async getAll(): Promise<ICountry[]> {
    return this.load('allCountries');
  }

  /**
   * Return country observable
   */
  public countryChange(): Observable<string> {
    return this.country.asObservable();
  }

  /**
   * getCountriesByISO
   */
  public async getCountriesByISO(): Promise<{ [iso: string]: ICountry }> {
    const countries = await this.getAll();
    const countriesByISO = {};

    countries.map((country: ICountry) => {
      countriesByISO[country.iso] = country;
    });

    return countriesByISO;
  }

  /**
   * getCountriesByISO
   */
  public async getCountriesByISOFilter(countriesWanted: string[]): Promise<{ [iso: string]: ICountry }> {
    const countries = await this.getAll();
    const countriesByISO = {};

    countriesWanted.map((iso: string) => {
      const countryObject = countries.find((country) => country.iso === iso);

      if (countryObject.deliver) {
        countriesByISO[iso] = countryObject;
      }
    });

    return countriesByISO;
  }

  /**
   * Stores country
   *
   * @param country ISO
   */
  public setCountry(country: string): void {
    this.storageSrv.set('location', country);
    this.storageSrv.clear('filters');

    const fullCountry: ICountry = this.getCurrentCountry();

    void import(`/node_modules/@angular/common/locales/${fullCountry.locale}.mjs`).then(
      (module) => {
        registerLocaleData(module.default);
      },
      () => {
        import(`/node_modules/@angular/common/locales/${fullCountry.locale.split('-')[0]}.mjs`).then(
          (module) => {
            registerLocaleData(module.default);
          },
          (error) => {
            // Just catch
            console.log(error);
          }
        );
      }
    );

    this.country.next(country);
  }

  /**
   * Returns country ISO
   *
   */
  public getCountry(init = false): string {
    let country = this.storageSrv.get('location') || this.route.snapshot.queryParamMap.get('country') || null;

    if (!country && !init) {
      const userData = this.storageSrv.getCurrentUser();

      if (userData?.addresses) {
        for (const address of userData.addresses) {
          if (address.country && address.favourite) {
            country = address.country;
            break;
          }
        }

        if (!location && userData.addresses[0]) {
          country = userData.addresses[0].country;
        }
      }

      if (!country) {
        const countries = {
          es: 'es',
          en: 'gb',
          fr: 'fr',
          de: 'de',
          it: 'it',
          nl: 'nl',
          sv: 'se',
        };

        country = countries[this.langSrv.getCurrentLang()] || countries.es;
      }

      // this.storageSrv.set('location', country);
    }

    return country;
  }

  /**
   * Filter country by iso
   *
   * @param iso country iso
   * @param countries array of countries
   */
  public async getCountryByIso(iso?: string, countries?: any[]): Promise<any> {
    const list = countries?.length > 0 ? countries : await this.get();
    const actual = iso || this.getCountry();

    return list.find((country) => country.iso === actual);
  }

  getCurrentCountry(): ICountry {
    if (Array.isArray(this.countries) && Array.isArray(this.allCountries)) {
      const countryWithShipment: ICountry = this.countries.find((c) => c.iso === this.getCountry());
      const countryWithoutShipment: ICountry = this.allCountries.find((c) => c.iso === this.getCountry());

      return countryWithShipment || countryWithoutShipment || { iso: 'es', locale: 'es-ES', currency: 'EUR' };
    } else {
      return { iso: 'es', locale: 'es-ES', currency: 'EUR' };
    }
  }

  /**
   * Return true if location is not one of the countries we deliver
   */
  public async hasNotAvailableCountry(): Promise<boolean> {
    const currentCountry = this.storageSrv.get('location') || null;
    const availableCountries = await this.get();
    const isAvailableCountry = availableCountries.filter((country: ICountry) => country.iso === currentCountry).length > 0;

    return !isAvailableCountry;
  }

  /**
   * Return if remote config is ready Observable
   */
  public getCountriesLoaded(): Observable<boolean> {
    return this.areCountriesLoaded$.asObservable();
  }
}
