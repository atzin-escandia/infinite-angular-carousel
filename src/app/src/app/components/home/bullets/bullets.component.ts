import { Component, Injector } from '@angular/core';
import { BaseComponent } from '../../base';

@Component({
  selector: 'bullets-container',
  templateUrl: './bullets.component.html',
  styleUrls: ['./bullets.component.scss'],
})

export class BulletsComponent extends BaseComponent {
  cards = [
    {
      img: `${this.env.domain}/assets/icon/home/farmer-icon.svg`,
      title: 'value-proposition1.home.text-info',
    },
    {
      img: `${this.env.domain}/assets/icon/home/bee-icon.svg`,
      title: 'value-proposition2.home.text-info',
    },
    {
      img: `${this.env.domain}/assets/icon/home/box-icon.svg`,
      title: 'value-proposition3.home.text-info',
    },
  ];

  constructor(public injector: Injector) {
    super(injector);
  }
}
