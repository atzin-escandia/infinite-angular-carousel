import {Component, Injector, OnInit} from '@angular/core';
import {CountryService, RouterService, StateService, StorageService} from '../../services';
import {PopoverBaseComponent} from '../base/base.component';
import {VisitFromStorageKey} from '../../enums/storage-key-visit-from.enum';
import {ILanguage} from '../../interfaces/language.interface';
import {ICountry} from '../../interfaces/country.interface';
import {environment} from '../../../environments/environment';
import {MediatorsService} from '../../../app/mediators/mediators.service';

@Component({
  selector: 'location-lang-mobile',
  templateUrl: './location-lang-mobile.component.html',
  styleUrls: ['./location-lang-mobile.component.scss']
})
export class LocationLangMobileComponent extends PopoverBaseComponent implements OnInit {
  public showCloseButton = false;
  public isDeliveryCountry = false;
  public closeOnClickCountry = false;
  public isTransitionRightActive = false;
  public isTransitionLeftActive = false;
  public onClose: (closeMobileMenu: boolean) => void;
  public inputSearch = '';
  public countriesOrLanguagesToShow: ICountry[] | ILanguage[];
  public selectedItem: ICountry | ILanguage | any;
  public hasNotAvailableCountry = false;
  public env = environment;

  constructor(
    public injector: Injector,
    private countrySrv: CountryService,
    private routerSrv: RouterService,
    private storageSrv: StorageService,
    private mediatorSrv: MediatorsService,
    private stateSrv: StateService,
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    this.isTransitionRightActive = true;

    if (this.isDeliveryCountry) {
      this.countriesOrLanguagesToShow = await this.countrySrv.get();
      this.countriesOrLanguagesToShow.sort((a: ICountry, b: ICountry) => {
        const aLang = a._m_order || a._m_name;
        const bLang = b._m_order || b._m_name;

        const x = aLang[this.langSrv.getCurrentLang()] || aLang.en;
        const y = bLang[this.langSrv.getCurrentLang()] || bLang.en;

        return x < y ? -1 : x > y ? 1 : 0;
      });
      this.hasNotAvailableCountry = await this.countrySrv.hasNotAvailableCountry();
      this.selectedItem = this.hasNotAvailableCountry ? undefined : this.countrySrv.getCurrentCountry();
    } else {
      this.countriesOrLanguagesToShow = this.langSrv.getMenuLangs();
      this.selectedItem = this.countriesOrLanguagesToShow
        .filter((item: ILanguage) => item.shortName === this.langSrv.getCurrentLang().toUpperCase())[0];
    }
  }

  public typeSearch(text: string): void {
    this.inputSearch = text;
  }

  public async changeSelectedCountryLang(newItem: ICountry | ILanguage): Promise<void> {
    this.mediatorSrv.emitNotAvailableShipmentCountry(false);
    this.selectedItem = newItem;
    // Change delivery country
    if (this.isDeliveryCountry) {
      const newCountryIso = this.selectedItem?.iso;

      this.countrySrv.setCountry(newCountryIso);
      this.stateSrv.setCurrentCountry(newCountryIso);
      this.inputSearch = '';

      if (this.hasNotAvailableCountry) {
        this.storageSrv.set(VisitFromStorageKey.notAvailableShipmentCountry, false);
        this.hasNotAvailableCountry = false;
      }

      if (this.closeOnClickCountry) {
        this.closeModal(true);
      }

      void this.langSrv.setCurrentLang(this.langSrv.getCurrentLang());
    } else {
      // Change language
      await this.changeLang(this.selectedItem?.shortName);
    }
  }

  /**
   * Change lang
   */
   private async changeLang(value: string): Promise<void> {
    if (!this.domSrv.isPlatformBrowser()) {
      return;
    }

    this.routerSrv.navigate(this.routerSrv.removeUrlLang(), value.toLowerCase());
    this.storageSrv.set('lastLanguage', value);
    await this.textSrv.get(value.toLowerCase());
  }

  /**
   * Close this modal and go back to the mobile menu or close the mobile menu too
   */
  public closeModal(closeMobileMenu = false): void {
    // Go back to the menu transition
    this.isTransitionLeftActive = !closeMobileMenu;
    this.onClose(closeMobileMenu);
  }
}
