import { Component, Injector, Input } from '@angular/core';
import { BaseComponent } from '../index';

@Component({
  selector: 'status-box',
  templateUrl: './status-box.component.html',
  styleUrls: ['./status-box.component.scss']
})
export class StatusBoxComponent extends BaseComponent {
  @Input() color = 'grey';
  @Input() icon: string;
  @Input() class: string;

  constructor(public injector: Injector) {
    super(injector);
  }
}
