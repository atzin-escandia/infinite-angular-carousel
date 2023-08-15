import { Component, Injector } from '@angular/core';
import { BaseComponent } from '@components/base';

@Component({
  selector: 'alcohol-information',
  templateUrl: './alcohol-information.component.html',
  styleUrls: ['./alcohol-information.component.scss'],
})
export class AlcoholInformationComponent extends BaseComponent {
  public alcoholInfoArray: string[] = [
    'Alcohol abuse dangerous',
    'Alcohol not consumed pregnant women',
    'Alcohol sales to minors prohibited',
    'Legal age to buy alcohol',
  ];

  constructor(public injector: Injector) {
    super(injector);
  }
}
