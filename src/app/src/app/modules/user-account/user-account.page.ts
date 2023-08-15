import { Component, OnInit, Injector, ViewEncapsulation } from '@angular/core';
import { BasePage } from '../../pages';

@Component({
  selector: 'private-zone',
  templateUrl: './user-account.page.html',
  styleUrls: ['./user-account.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserAccountPageComponent extends BasePage implements OnInit {
  constructor(public injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.setLoading(false);

    this.route.queryParams.subscribe(params => {
      if (params.app === 'true') {
        this.domSrv.showHeader(false);
        this.domSrv.showFooter(false);
      }
    });
  }
}
