import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  @Input() selectable = false;
  @Input() selected = false;
  @Input() withInputBtn = false;
  @Input() multi = false;
  @Input() inputBtnPosition: 'left' | 'right' = 'right';
  @Input() hasFooter = false;

  @Output() selectTrigger = new EventEmitter();

  onSelect(): void {
    this.selectTrigger.emit();
  }
}
