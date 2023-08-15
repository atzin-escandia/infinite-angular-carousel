import { Component, Input } from '@angular/core';

@Component({
  selector: 'base-card',
  templateUrl: './base-card.component.html',
  styleUrls: ['./base-card.component.scss'],
})
export class BaseCardComponent {
  @Input() public title = '';
  @Input() public description = '';
  @Input() public img = '';
  @Input() public price = '';
  @Input() public pricePer = '';
}
