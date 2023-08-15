import {Component, OnInit, ChangeDetectorRef, AfterContentChecked} from '@angular/core';
import {PopupsInterface} from '../popups.interface';
import {PopupsRef} from '../popups.ref';
import {TextService} from '../../services/text';
import {AuthService} from '../../services/auth';
import {UtilsService} from '../../services/utils';
import {CheckDataService} from '../../services/check-data';
import {CountryService, EventService, LangService, LoaderService, StorageService} from '../../services';

@Component({
  selector: 'soft-register-popup',
  templateUrl: './soft-register.component.html',
  styleUrls: ['./soft-register.component.scss']
})
export class SoftRegisterPopupComponent implements OnInit, AfterContentChecked {
  public countries: any;
  public countriesByIso: any;

  public selectedCountry: any;
  public countryDetected: any;

  public onClose: any;

  public crowdfarmer: any = {
    country: '',
    name: '',
    surnames: '',
    email: ''
  };

  public errorIn: any = {
    country: false,
    name: false,
    surnames: false,
    email: false
  };

  constructor(
    public config: PopupsInterface,
    public popup: PopupsRef,
    private countrySrv: CountryService,
    private langSrv: LangService,
    public textSrv: TextService,
    public loaderSrv: LoaderService,
    public authSrv: AuthService,
    public utilsSrv: UtilsService,
    private storageSrv: StorageService,
    public checkSrv: CheckDataService,
    public eventSrv: EventService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    if (!this.countries) {
      this.countries = this.config.data.allCountries;
    }
    if (!this.countriesByIso) {
      this.countriesByIso = await this.countrySrv.getCountriesByISO();
    }

    this.countries.sort((a, b) => {
      const x = a._m_name[this.langSrv.getCurrentLang()] || a._m_name.en;
      const y = b._m_name[this.langSrv.getCurrentLang()] || b._m_name.en;

      return x < y ? -1 : x > y ? 1 : 0;
    });
    this.countryDetected = this.storageSrv.get('location');
    this.crowdfarmer.country = this.countryDetected;
    if (this.config.data.newLocation) {
      await this.updateCountry(this.config.data.newLocation);
    }
  }

  public async updateCountry(country: string): Promise<any> {
    this.crowdfarmer.country = country;
    this.selectedCountry = await this.countrySrv.getCountryByIso(country);
  }

  public formValid(): boolean {
    this.errorIn.country = this.crowdfarmer.country.length < 1;
    this.errorIn.name = this.crowdfarmer.name.length < 1;
    this.errorIn.surnames = this.crowdfarmer.surnames.length < 1;
    this.errorIn.email = !this.checkSrv.emailIsValid(this.crowdfarmer.email);

    return this.checkSrv.formValidation(this.errorIn, true);
  }

  public async registerUser(): Promise<null> {
    if (this.formValid()) {
      this.loaderSrv.setLoading(true);
      const sendUser = {
        country: this.crowdfarmer.country,
        countryDetected: this.countryDetected,
        name: this.crowdfarmer.name,
        email: this.crowdfarmer.email.toLowerCase(),
        notificationLanguage: this.langSrv.getCurrentLang(),
        surnames: this.crowdfarmer.surnames,
        registrationInfo: {
          url: this.utilsSrv.getFullUrl()
        }
      };

      this.onClose({msg: this.textSrv.getText('User registered')});
      const resp = await this.authSrv.soft(sendUser);

      if (resp) {
        this.loaderSrv.setLoading(false);
        this.storageSrv.set('softRegistered', true);
      }
    } else {
      return;
    }
  }

  public closeSoftRegister(): void {
    this.eventSrv.dispatchEvent('closeAndOpenPopup', 'CountriesPopupComponent');
  }

  // Need to prevent error
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }
}
