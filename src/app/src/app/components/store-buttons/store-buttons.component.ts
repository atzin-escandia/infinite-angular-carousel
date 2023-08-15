import {Component, Injector} from '@angular/core';

import {BaseComponent} from '../base';

@Component({
  selector: 'store-buttons',
  templateUrl: './store-buttons.component.html',
  styleUrls: ['./store-buttons.component.scss']
})
export class StoreButtonsComponent extends BaseComponent {
  constructor(public injector: Injector) {
    super(injector);
  }

  public getBadge(os: string): string {
    let lang = 'en';

    switch (this.langSrv.getCurrentLang()) {
      case 'es':
      case 'en':
      case 'de':
      case 'fr':
        lang = this.langSrv.getCurrentLang();
    }

    if (os === 'android') {
      return 'https://common.crowdfarming.com/images/badges/' + lang + '/android.svg';
    } else {
      return 'https://common.crowdfarming.com/images/badges/' + lang + '/ios.svg';
    }
  }

}
