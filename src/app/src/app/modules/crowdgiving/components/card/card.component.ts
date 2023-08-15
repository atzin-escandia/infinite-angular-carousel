import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DsLibraryModule } from '@crowdfarming/ds-library';

@Component({
  standalone: true,
  selector: 'cg-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  imports: [CommonModule, DsLibraryModule]
})
export class CrowdgivingCardComponent {
  @Input() selectable = false;
  @Input() selected = false;
  @Input() withInputBtn = false;
  @Input() multi = false;
  @Input() inputBtnPosition: 'left' | 'right' = 'right';
  @Input() hasFooter = false;

  @Output() selectTrigger = new EventEmitter<boolean>();

  onCheckboxChange(val: boolean): void {
    this.selectTrigger.emit(val);
  }

  onRadioButtonChange(val: boolean): void {
    this.selectTrigger.emit(val);
  }
}
