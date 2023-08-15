import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  Input,
  Injector,
  ViewEncapsulation,
  ChangeDetectorRef,
  AfterContentChecked,
  OnDestroy
} from '@angular/core';
import { BaseComponent } from '@components/base';
import { CountryService, CheckDataService, USStatesService } from '@app/services';
import { Subscription } from 'rxjs';
import { CaProvincesService } from '@services/ca-provinces';
import { IAddress, ICountry } from '@app/interfaces';

@Component({
  selector: 'address-component',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddressComponent extends BaseComponent implements OnInit, AfterContentChecked, OnDestroy {
  @Input() public new: boolean;
  @Input() public checkWhenOpen = false;
  @Input() public address: IAddress;
  @Output() public countryChanged = new EventEmitter<string>();
  @Input() public countries: ICountry[];
  @Input() public countriesByIso: any;
  @Input() public currentAddress: any;
  @Input() public errorIn: any;

  public maxMask = 0;
  public countriesPrefix: any;
  public currentCountry: any;
  public countrySubscription: Subscription;
  public loaded = false;

  public statesNames: any;
  public provinceNames: any;

  constructor(
    public injector: Injector,
    public countrySrv: CountryService,
    public checkSrv: CheckDataService,
    private cdr: ChangeDetectorRef,
    public USStatesSrv: USStatesService,
    public CaProvincesSrv: CaProvincesService
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    if (!this.countries) {
      this.countries = await this.countrySrv.get();
    }
    if (!this.countriesByIso) {
      this.countriesByIso = await this.countrySrv.getCountriesByISO();
    }

    this.currentCountry = this.address.country
      ? this.countriesByIso[this.address.country]
      : this.countriesByIso[this.countrySrv.getCountry()];

    if (this.currentAddress) {
      for (const country of this.countries) {
        if (this.currentAddress.country === country.iso) {
          this.countries = [];
          this.countries.push(country);
        }
      }
    }

    if (this.countries.length === 1) {
      this.countriesPrefix = await this.countrySrv.get();
    } else {
      this.countriesPrefix = this.countries;
    }

    this.loaded = true;

    if (this.checkWhenOpen) {
      this.checkEveryField();
    }

    this.countrySubscription = this.countrySrv.countryChange().subscribe(country => {
      this.currentCountry = this.countriesByIso[country];
    });

    await this.getUSStates();
    await this.getCaProvinces();
  }

  /**
   * Prefix from selector
   */
  public getCountryPrefix(e: string): void {
    this.address.phone.prefix = e;
  }

  public manageInput(key: string, formKeyUp: boolean = false): void {
    this.checkSrv.manageInput(this.address, this.errorIn, this.countriesByIso, this.maxMask, key, formKeyUp);
  }

  /**
   * Get US states
   */
  public async getUSStates(): Promise<any> {
    const usStates = await this.USStatesSrv.get();

    this.statesNames = usStates.map(state => state.name).sort((a, b) => {
                                                          if (a < b) {
                                                            return -1;
                                                          } else if (a > b) {
                                                            return 1;
                                                          } else {
                                                            return 0;
                                                          }
                                                        });
  }

  public async getCaProvinces(): Promise<any> {
    const caProvinces = await this.CaProvincesSrv.get();

    this.provinceNames = caProvinces.map(province => province.name).sort((a, b) => {
                                                          if (a < b) {
                                                            return -1;
                                                          } else if (a > b) {
                                                            return 1;
                                                          } else {
                                                            return 0;
                                                          }
                                                        });
  }


  public selectUSState(evt: string): void {
    this.address.province = evt;
  }

  public selectCaProvince(evt: string): void {
    this.address.province = evt;
  }


  /**
   * Country from selector
   */
  public getCountry(e: string): void {
    this.address.country = e;
    this.address.zip = '';
    this.countryChanged.emit(e);
    this.currentCountry = this.countriesByIso[e];

    // adding first province/state by default in US or Canadá address

    if (e === 'ca') {
      this.address.province = this.provinceNames[0];
    } else if (e === 'us') {
      this.address.province = this.statesNames[0];
    } else {
      this.address.province = '';
    }

  }

  /**
   * Makes a first check
   */
  private checkEveryField(): void {
    for (const key in this.errorIn) {
      if (key !== 'validZip' && key !== 'lengthZip') {
        this.manageInput(key);
      }
    }
  }

  // Need to prevent error
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.countrySubscription) {
      this.countrySubscription.unsubscribe();
    }
  }
}
