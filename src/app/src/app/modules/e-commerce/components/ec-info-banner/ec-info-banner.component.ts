import { Component, Input, OnInit } from '@angular/core';
import { Option } from '../../interfaces';
import { ECommerceService } from '../../services';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'ec-info-banner',
  templateUrl: './ec-info-banner.component.html',
  styleUrls: ['./ec-info-banner.component.scss'],
})
export class EcInfoBannerComponent implements OnInit {
  @Input() items: Option[] = [
    {
      label: 'page.how-ecommerce-works-1.title',
      desc: 'page.how-ecommerce-works-1.body',
      img: '../../../../../assets/img/e-commerce/Pop-up-informativo-1.svg',
    },
    {
      label: 'page.how-ecommerce-works-2.title',
      desc: 'page.how-ecommerce-works-2.body',
      img: '../../../../../assets/img/e-commerce/Pop-up-informativo-2.svg',
    },
  ];

  isVisibleBanner = false;

  isDetail = false;

  constructor(private eCommerceService: ECommerceService, private route: ActivatedRoute ) {}

  ngOnInit(): void {
    this.getRoute();
    this.onShowBanner();
  }

  getRoute(): void {
    this.isDetail = this.route.snapshot.data.isDetail;
  }

  onShowBanner(): void {
    this.isVisibleBanner = this.eCommerceService.isBannerEnabled();
  }

  hideBanner(): void {
    this.eCommerceService.setStorageBanner();
    this.onShowBanner();
  }

  showBanner(): void {
    this.eCommerceService.removeStorageBanner();
    this.onShowBanner();
  }
}
