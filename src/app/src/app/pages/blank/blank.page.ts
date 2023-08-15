import {Component, Injector} from '@angular/core';

import {BasePage} from '../base';

@Component({
  selector: 'blank-page',
  templateUrl: './blank.page.html',
  styleUrls: ['./blank.page.scss']
})
export class BlankPageComponent extends BasePage {
  constructor(public injector: Injector) {
    super(injector);
  }
}
