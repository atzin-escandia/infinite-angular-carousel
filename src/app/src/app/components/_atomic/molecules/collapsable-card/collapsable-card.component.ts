import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AUTO_STYLE, animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'collapsable-card',
  templateUrl: './collapsable-card.component.html',
  styleUrls: ['./collapsable-card.component.scss'],
  animations: [
    trigger('collapse', [
      state('false', style({ height: AUTO_STYLE, visibility: AUTO_STYLE })),
      state('true', style({ height: '0', visibility: 'hidden' })),
      transition('false => true', animate(300 + 'ms ease-in')),
      transition('true => false', animate(300 + 'ms ease-out')),
    ]),
  ],
})
export class CollapsableCardComponent {
  @Input() title: string;
  @Input() isActive = false;

  @Output() isActiveChange = new EventEmitter<boolean>();

  onIsActiveChange(): void {
    this.isActiveChange.emit(!this.isActive);
  }
}
