import {Component, Input, Output, EventEmitter, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-options-filter',
  templateUrl: './options-filter.component.html',
  styleUrls: ['./options-filter.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OptionsFilterComponent {
  @Input() options: any;
  @Input() optionsToShow: any;
  @Input() customClass: any;
  @Input() active = false;
  @Input() restoreText: string;
  @Input() applyText: string;
  @Input() statusChecked: any = {};

  @Output() modalClosed = new EventEmitter<any>();

  /**
   * Reset all options to false
   */
  resetData(): void {
    for (const key in this.statusChecked) {
      if (this.statusChecked.hasOwnProperty(key)) {
        this.statusChecked[key] = false;
      }
    }
  }

  /**
   * send info to parent component, it will close the modal
   */
  closeModal(): void {
    this.modalClosed.emit(this.statusChecked);
  }
}
