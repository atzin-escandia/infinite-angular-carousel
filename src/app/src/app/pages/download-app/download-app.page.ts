import {Component, OnInit, Injector} from '@angular/core';
import {BasePage} from '../base';

@Component({
  selector: 'download-app',
  templateUrl: './download-app.page.html',
  styleUrls: ['./download-app.page.scss']
})

export class DownloadAppPageComponent extends BasePage implements OnInit{
  public lang: string;
  public isMobile: boolean;

  public benefits = [
    {
      text:  'promo-app-benefit-1',
      img: this.env.domain + '/assets/img/promotion-campaign/benefits/a.svg'
    }, {
      text:  'promo-app-benefit-2',
      img: this.env.domain + '/assets/img/promotion-campaign/benefits/b.svg'
    }, {
      text: 'promo-app-benefit-3',
      img: this.env.domain + '/assets/img/promotion-campaign/benefits/c.svg'
    }, {
      text:  'promo-app-benefit-4',
      img: this.env.domain + '/assets/img/promotion-campaign/benefits/d.svg'
    },
  ];

  public cards = [
    {
      text:  'promo-app-card-1',
      img: this.env.domain + '/assets/img/promotion-campaign/steps/p1.svg'
    }, {
      text:  'promo-app-card-2',
      img: this.env.domain + '/assets/img/promotion-campaign/steps/p2.svg'
    }, {
      text:  'promo-app-card-3',
      img: this.env.domain + '/assets/img/promotion-campaign/steps/p3.svg'
    }
  ];

  public outerContentValues: any;
  public outerContentMultilocal: any;
  public innerContentMultilocal: any;
  public contentCenterMultilocal: number;

  constructor(public injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.setLoading(false);
    this.setInnerLoader(false, false);

    this.lang = this.langSrv.getCurrentLang();
    this.lang = ['es', 'de', 'fr', 'en'].includes(this.lang) ? this.lang : 'en';
    this.isMobile = this.domSrv.getIsDeviceSize();
  }
}
