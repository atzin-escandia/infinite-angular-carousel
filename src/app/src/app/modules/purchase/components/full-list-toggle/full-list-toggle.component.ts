import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TextService } from '../../../../services';

@Component({
  selector: 'full-list-toggle',
  templateUrl: './full-list-toggle.component.html',
  styleUrls: ['./full-list-toggle.component.scss'],
})
export class FullListToggleComponent {
  @Input() displayFullList = false;

  @Output() displayFullListChange = new EventEmitter<boolean>();

  constructor(public textSrv: TextService) {}

  onClick(): void {
    this.displayFullListChange.emit(!this.displayFullList);
  }
}
