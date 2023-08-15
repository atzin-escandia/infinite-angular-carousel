import {Component, OnInit, Injector, ViewEncapsulation} from '@angular/core';

import {BasePage} from '../base';

@Component({
  selector: 'tos-page',
  templateUrl: './tos.page.html',
  styleUrls: ['./tos.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ToSPageComponent extends BasePage implements OnInit {

  constructor(public injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.app) {
      this.domSrv.showHeader(false);
      this.domSrv.showFooter(false);
    }
    this.setLoading(false);
    this.setInnerLoader(false, false);
  }
}
