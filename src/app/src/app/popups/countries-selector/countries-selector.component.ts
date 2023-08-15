import {Component, OnInit, ChangeDetectorRef, AfterContentChecked, Input} from '@angular/core';
import {PopupsInterface} from '../popups.interface';
import {PopupsRef} from '../popups.ref';
import {TextService} from '../../services/text';
import {DomService} from '../../services';

@Component({
  selector: 'countries-selector-popup',
  templateUrl: './countries-selector.component.html',
  styleUrls: ['./countries-selector.component.scss']
})
export class CountriesPopupComponent implements OnInit, AfterContentChecked {
  static className = 'CountriesPopupComponent';
  public onClose: any;
  public clicked: number;
  public prefixes: any[];
  public isos: any[];
  public countries: any[];
  public source: string;

  @Input() flag = true;

  constructor(
    public config: PopupsInterface,
    public popup: PopupsRef,
    public textSrv: TextService,
    private cdr: ChangeDetectorRef,
    public domSrv: DomService
  ) { }

  ngOnInit(): void {
    if (this.config.data.prefixes) {
      this.prefixes = this.config.data.prefixes;
      this.isos = this.config.data.isos;
    }

    if (this.config.data.countries) {
      this.countries = this.config.data.countries;
      this.clicked = this.countries.map(country => country.iso).indexOf(this.config.data.selectedLocation);
    }

    if (this.config.data.source) {
      this.source = this.config.data.source;
    }
  }

  public selectOption(id: number): void {
    this.clicked = id;
    this.onClose(id);
  }

  // Need to prevent error
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }
}
