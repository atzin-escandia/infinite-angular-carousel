import { Component, Injector, Input, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from '@components/base';
import { CountriesPopupComponent } from '@popups/countries-selector';
import { CountryService } from '@app/services';

@Component({
  selector: 'up-header-messages',
  templateUrl: './up-header-messages.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class UpHeaderMessagesComponent extends BaseComponent {
  @Input() public up: any;
  @Input() public ss: any;
  @Input() public selectedCountry: string;
  @Input() public countriesByIso: any;
  @Input() public availableCountriesByISO: any;

  constructor(public injector: Injector, public countrySrv: CountryService) {
    super(injector);
  }

  /**
   * Open location selector popup
   */
  public openLocationSelector(): void {
    const countriesPopup = this.popupSrv.open(CountriesPopupComponent, {
      data: {
        countries: this.availableCountriesByISO,
        flag: true,
        source: 'up-card',
        selectedCountry: this.selectedCountry,
      },
    });

    countriesPopup.onClose.subscribe((result: any) => {
      if (result || result === 0) {
        this.selectedCountry = this.availableCountriesByISO[result].iso;
        this.countrySrv.setCountry(this.availableCountriesByISO[result].iso);
      }
    });
  }
}
