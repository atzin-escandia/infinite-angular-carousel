import {Component, OnInit, Injector, OnDestroy, ViewEncapsulation, HostBinding} from '@angular/core';
import {PopoverBaseComponent} from '../base/base.component';
import {CountryService, RouterService, StorageService} from '../../services';
import {ILanguage} from '../../interfaces/language.interface';
import {ICountry} from '../../interfaces/country.interface';
import {environment} from '../../../environments/environment';
import {StateService} from '../../services/state/state.service';

@Component({
  selector: 'location-selector',
  templateUrl: './location-selector.component.html',
  styleUrls: ['./location-selector.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LocationLangComponent extends PopoverBaseComponent implements OnInit, OnDestroy {
  @HostBinding('class.popover-is-open') isOpen;
  public topSpace = true;
  public products: any;
  public languages = this.langSrv.getMenuLangs();
  public countries: ICountry[];
  public countriesByIso: any;
  public currentIso: any;
  public onClose: (changedCountry: boolean) => void;
  public newLang: ILanguage;
  public newCountry: string;
  public hasNotAvailableCountry = false;
  public env = environment;

  constructor(
    public injector: Injector,
    private countrySrv: CountryService,
    public routerSrv: RouterService,
    private storageSrv: StorageService,
    private stateSrv: StateService,
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
    this.currentIso = this.countrySrv.getCountry();

    this.countries.sort((a, b) => {
      const aLang = a._m_order || a._m_name;
      const bLang = b._m_order || b._m_name;

      const x = aLang[this.langSrv.getCurrentLang()] || aLang.en;
      const y = bLang[this.langSrv.getCurrentLang()] || bLang.en;

      return x < y ? -1 : x > y ? 1 : 0;
    });

    this.hasNotAvailableCountry = await this.countrySrv.hasNotAvailableCountry();
    this.newCountry = this.hasNotAvailableCountry ? '' : this.countrySrv?.getCurrentCountry()?.iso;
    this.newLang = {
      longName: '',
      shortName: this.langSrv?.getCurrentLang()?.toUpperCase()
    };

    this.start({
      active: true,
      style: 'background-color: rgba(0,0,0,0); z-index: 201',
      close: () => this.closeWithAnimation()
    });

    setTimeout(() => {
      this.isOpen = true;
    }, 0);
  }

  /**
   * Change lang
   */
  public changeLang(value: string): Promise<any> {
    if (!this.domSrv.isPlatformBrowser()) {
      return;
    }

    const route = this.routerSrv.getPath().includes('order/checkout') && this.routerSrv.getPath(true).includes('section=cart') ?
      `${this.routerSrv.removeUrlLang()}?${this.routerSrv.getPath(true)}` :
      this.routerSrv.removeUrlLang();

    const scroll = window.scrollY || window.pageYOffset;

    this.routerSrv.navigate(route, value.toLowerCase());

    this.storageSrv.set('lastLanguage', value);

    void this.textSrv.get(value.toLowerCase());

    void this.langSrv.setCurrentLang(value.toLocaleLowerCase());

    setTimeout(() => {
      window.scroll({
        top: scroll,
        left: window.innerHeight / 2
      });
    }, 0);
  }

  /**
   * Change country
   */
  public changeCountry(countryIso: string): void {
    this.countrySrv.setCountry(countryIso);
    this.currentIso = countryIso;
  }

  public accept(): void {
    if (this.currentIso !== this.newCountry) {
      this.changeCountry(this.newCountry);
      this.stateSrv.setCurrentCountry(this.newCountry);
    }

    this.newLang && void this.changeLang(this.newLang.shortName);

    this.closeWithAnimation(true);
  }

  ngOnDestroy(): void {
    this.isOpen = false;
  }

  /**
   * Close popover
   */
  public closeWithAnimation(closeMobileMenu: boolean = false): void {
    this.isOpen = false;

    setTimeout(() => {
      this.close();
      this.onClose(closeMobileMenu && !!this.newCountry);
      closeMobileMenu && this.utilsSrv.closeMobileMenu();
    }, 300);
  }
}
