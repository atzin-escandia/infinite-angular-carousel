import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-select-country',
  templateUrl: './select-country.component.html',
  styleUrls: ['./select-country.component.scss']
})
export class SelectCountryComponent {
  @Input() countries: any;
  @Input() countrySelected: string;
  @Input() active: boolean;

  @Output() modalClosed = new EventEmitter<string>();

  closeModal(selected?: string): void {
    if (selected) {
      this.countrySelected = selected;
    }
    this.active = false;
    this.modalClosed.emit(this.countrySelected);
  }
}
