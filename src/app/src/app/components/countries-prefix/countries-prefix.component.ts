import { Component, OnInit, Input, Injector, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { BaseComponent } from '../base';
import { CountriesPopupComponent } from '@popups/countries-selector';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'countries-prefix',
  templateUrl: './countries-prefix.component.html',
  styleUrls: ['./countries-prefix.component.scss'],
})
export class CountriesPrefixComponent extends BaseComponent implements OnInit {
  @ViewChild('countrySelector ', { static: true }) public selector: ElementRef;

  @Input() public data = [];
  @Input() public selected?: any;
  @Input() public error = false;
  @Input() public mandatory = false;

  @Output() public returnData = new EventEmitter<string>();

  public prefixSelect: any = [];
  public isoSelect: any = [];
  public dataToReturn = '';
  public selectorElm: any;
  public prefixPlaceholder = this.translocoSrv.translate('global.country-code.form');

  constructor(public injector: Injector, public translocoSrv: TranslocoService) {
    super(injector);
  }

  ngOnInit(): void {
    this.selectorElm = this.selector;

    if (this.selected) {
      this.dataToReturn = this.selected;
    }

    // Format country array for visualization
    for (const country of this.data) {
      this.prefixSelect.push(country.prefix);
      this.isoSelect.push(country.iso);
    }
  }

  /**
   * Save prefix set on component
   */
  public savePrefix(): void {
    this.returnData.emit(this.dataToReturn);
  }

  public selectOption(option: string): void {
    this.dataToReturn = option;
    this.savePrefix();
  }

  public openPrefixSelector(): void {
    // We need to spin the cf-select arrow adding the cf-select-open class and hide the options' container for mobile
    this.selectorElm.container.nativeElement.children[1].classList.add('hide-mobile');
    this.selectorElm.container.nativeElement.classList.add('cf-select-open');

    const popup = this.popupSrv.open(CountriesPopupComponent, {
      data: {
        prefixes: this.prefixSelect,
        isos: this.isoSelect,
      },
    });

    popup.onClose.subscribe((result) => {
      this.dataToReturn = result >= 0 ? this.prefixSelect[result] : this.selected;
      this.savePrefix();
      // We set cf-select properties back
      this.selectorElm.container.nativeElement.classList.remove('cf-select-open');
      this.selectorElm.container.nativeElement.children[1].classList.remove('hide-mobile');
    });
  }
}
