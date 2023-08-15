import { Component, Injector, OnInit } from '@angular/core';
import { BasePage } from '../base';

@Component({
  selector: 'no-content',
  templateUrl: './no-content.page.html',
  styleUrls: ['./no-content.page.scss']
})
export class NoContentPageComponent extends BasePage implements OnInit {
  constructor(public injector: Injector) {
    super(injector);
    this.set404StatusCode();
  }
  HOME = 'home';
  links = [
    {
      key: 'global.go-home.buttom',
      link: 'home',
    },
    {
      key: 'page.user-account-cta-adopt-a-tree.button',
      link: 'ADOPTION',
    },
    {
      key: 'page.user-account-cta-buy-a-box.button',
      link: 'BOXES',
    },
  ];

  img = { path: '/assets/404/img1.json' };

  ngOnInit(): void {
    this.setLoading(false);
    this.setInnerLoader(false, false);
  }

  navigateTo(link: string): void {
    link === this.HOME ? this.routerSrv.navigate('') :
    this.routerSrv.navigateToFarmersMarket(link);
  }
}
