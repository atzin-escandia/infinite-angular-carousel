import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss'],
})
export class RadioButtonComponent {
  @Input() isSelected = false;
  @Output() isSelectedChange = new EventEmitter();

  onRadioClick(): void {
    this.isSelectedChange.emit();
  }
}
