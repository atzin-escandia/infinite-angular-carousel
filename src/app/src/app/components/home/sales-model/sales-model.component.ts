import { Component, Injector, OnInit } from '@angular/core';
import { BaseComponent } from '@components/base';
import { RouterService } from '@services/router/router.service';
import { DISCOVERY_BOX_VALID_COUNTRIES } from '@app/pages/subscription-box/constants/subscription-box.constants';
import { StateService } from '@services/state';
import { Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'sales-model',
  templateUrl: './sales-model.component.html',
  styleUrls: ['./sales-model.component.scss'],
})
export class SalesModelComponent extends BaseComponent implements OnInit {
  destroy$ = new Subject<void>();
  isMobile = this.domSrv.getIsDeviceSize();
  cards = [];
  cardsInfo = [
    {
      img: `${this.env.domain}/assets/img/home/Adoptions.jpg`,
      linkText: 'page.visit-projects.title',
      navigate: (): void => this.routerSrv.navigateToFarmersMarket('ADOPTION'),
    },
    {
      img: `${this.env.domain}/assets/img/home/OH.jpg`,
      linkText: 'page.try-our-products.title',
      navigate: (): void => this.routerSrv.navigateToFarmersMarket('BOXES'),
    },
    {
      img: `${this.env.domain}/assets/img/home/Ecommerce.jpg`,
      linkText: 'page.create-your-own.box.title',
      navigate: (): void => this.routerSrv.navigate('/subscription-box/seasonal-organic-fruits'),
    },
  ];

  constructor(public injector: Injector, public routerSrv: RouterService, private stateSrv: StateService) {
    super(injector);
  }

  ngOnInit(): void {
    this.stateSrv.$currentCountry.pipe(
      takeUntil(this.destroy$),
      tap((country) => this.handleDBox(country))
    ).subscribe();
  }

  handleDBox(country: string): void {
    this.cards = DISCOVERY_BOX_VALID_COUNTRIES.includes(country) ? this.cardsInfo : this.cardsInfo.slice(0, 2);
  }
}
