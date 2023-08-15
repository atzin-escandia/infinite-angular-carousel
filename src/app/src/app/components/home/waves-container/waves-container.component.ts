import { Component, Injector, Input } from '@angular/core';

import { BaseComponent } from '@components/base';

@Component({
  selector: 'waves-container',
  templateUrl: './waves-container.component.html',
  styleUrls: ['./waves-container.component.scss'],
})
export class WavesContainerComponent extends BaseComponent {
  @Input() waveColor = '';

  constructor(public injector: Injector) {
    super(injector);
  }
}
