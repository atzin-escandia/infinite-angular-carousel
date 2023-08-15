import { Component, OnInit, Input, Injector, Output, EventEmitter, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { EventService } from '@app/services';
import { BaseComponent } from '../base';
import { CountriesPopupComponent } from '@popups/countries-selector';

@Component({
  selector: 'country-selector',
  templateUrl: './country-selector.component.html',
  styleUrls: ['./country-selector.component.scss'],
})
export class CountrySelectorComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('countrySelector ', { static: true }) public selector: ElementRef;

  @Input() public data = [];
  @Input() public selected?: string;
  @Input() public error = false;
  @Input() public flag = true;
  @Input() public label?: string;
  @Input() public isSecondPopup = false;

  @Output() public returnData = new EventEmitter<string>();
  @Output() public closeEvt = new EventEmitter<boolean>();

  public countriesSelect: any = [];
  public countrySelect: any = [];
  public dataToReturn = '';
  public langSubs: any;
  public selectorElm: any;

  constructor(public injector: Injector, public eventSrv: EventService) {
    super(injector);
  }

  ngOnInit(): void {
    this.selectorElm = this.selector;

    if (this.selected) {
      this.dataToReturn = this.selected;
    }

    this.data = this.data.sort((a, b) => {
      a = a._m_name[this.langSrv.getCurrentLang()] || a._m_name.en;
      b = b._m_name[this.langSrv.getCurrentLang()] || b._m_name.en;
      if (a.toLowerCase() > b.toLowerCase()) {
        return 1;
      }
      if (a.toLowerCase() < b.toLowerCase()) {
        return -1;
      }

      return 0;
    });

    // Format country array for visualization
    for (const country of this.data) {
      this.countrySelect.push(country.iso);
    }

    this.langSubs = this.langSrv.getCurrent().subscribe(() => {
      this.countrySelect = [];
      for (const country of this.data) {
        this.countrySelect.push(country.iso);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.langSubs) {
      this.langSubs.unsubscribe();
    }
  }

  /**
   * Save prefix set on component
   */
  public saveCountry(): void {
    this.returnData.emit(this.dataToReturn);
  }

  public selectOption(option: string): void {
    this.dataToReturn = option;
    this.saveCountry();
  }

  public openCountrySelector(): void {
    // We need to spin the cf-select arrow adding the cf-select-open class and hide the options' container for mobile
    this.selectorElm.container.nativeElement.children[1].classList.add('hide-mobile');
    this.selectorElm.container.nativeElement.classList.add('cf-select-open');

    const popup = this.popupSrv.open(CountriesPopupComponent, {
      data: {
        countries: this.data,
        flag: this.flag,
      },
    });

    popup.onClose.subscribe((result) => {
      this.dataToReturn = result >= 0 ? this.countrySelect[result] : this.selected;
      this.saveCountry();
      // We set cf-select properties back
      this.selectorElm.container.nativeElement.classList.remove('cf-select-open');
      this.selectorElm.container.nativeElement.children[1].classList.remove('hide-mobile');
    });
  }
}
