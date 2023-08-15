import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-crowdgiving',
  templateUrl: './crowdgiving.component.html',
  styleUrls: ['./crowdgiving.component.scss'],
})
export class CrowdgivingComponent {
  @Input() isActive: boolean;
  @Output() isActiveChange = new EventEmitter<boolean>();

  onIsActiveChange(val: boolean): void {
    this.isActiveChange.emit(val);
  }
}
