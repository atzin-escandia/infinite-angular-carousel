import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
})
export class CustomChipComponent {
  @Input() text: string;
  @Input() canRemove: boolean;

  @Output() remove = new EventEmitter();

  removeClick(): void {
    this.remove.emit();
  }
}
