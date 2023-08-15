import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ICountryOpt } from '../../../../components/_atomic/interfaces/option.interface';
import { UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-countries-dropdown',
  templateUrl: './countries-dropdown.component.html',
  styleUrls: ['./countries-dropdown.component.scss'],
  animations: [
    trigger('rotateState', [
      state('default', style({ transform: 'rotate(0)' })),
      state('rotated', style({ transform: 'rotate(-180deg)' })),
      transition('rotated => default', animate('250ms ease-out')),
      transition('default => rotated', animate('250ms ease-in')),
    ]),
  ],
})
export class CountriesDropdownComponent implements OnInit {
  @Input() label = '';
  @Input() disabled = false;
  @Input() set value(value: string) {
    this._value = value;
    this.displayValue = this.options.find((elem) => (elem.prefix || elem.iso) === value);
  }

  get value(): string {
    return this._value;
  }

  @Input() placeholder = 'Select an option';
  @Input() searchbarPlaceholder = 'Search country';

  @Input() set options(options: ICountryOpt[]) {
    this._options = (options || []).sort((a, b) => a.label.localeCompare(b.label));
  }

  get options(): ICountryOpt[] {
    return this._options;
  }

  @Input() isDisabled: boolean;

  @Output() selectChange = new EventEmitter<{ iso: string; prefix?: string }>();

  @HostListener('document:click', ['$event'])
  clickout(event: Event): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isFocused = false;
      this.arrowState = 'default';
    }
  }

  _value: string;
  _options: ICountryOpt[] = [];
  displayValue: ICountryOpt;
  filteredOpts$: Observable<ICountryOpt[]>;
  isFocused = false;
  arrowState: 'default' | 'rotated' = 'default';
  searchCountryFC = new UntypedFormControl();

  constructor(private eRef: ElementRef) {}

  ngOnInit(): void {
    this.filteredOpts$ = this.searchCountryFC.valueChanges.pipe(
      startWith(''),
      map((searchText) => (searchText.length > 0 ? this.filterOpts(searchText) : this.options))
    );
  }

  onSelectClick(): void {
    this.isFocused = !this.isFocused;
    this.arrowState = this.arrowState === 'rotated' ? 'default' : 'rotated';
  }

  onOptionSelected(opt: ICountryOpt): void {
    this.searchCountryFC.setValue('');
    this.selectChange.emit({ iso: opt.iso, prefix: opt.prefix });
    this.isFocused = false;
    this.arrowState = 'default';
  }

  private filterOpts(searchText: string): ICountryOpt[] {
    const cleanSearchText = searchText.toLowerCase().trim();

    return this.options.filter((elem) => elem.label.toLowerCase().includes(cleanSearchText));
  }
}
