import { Component, Injector } from '@angular/core';
import { BaseComponent } from '@components/base';
import { RouterService } from '@services/router/router.service';

@Component({
  selector: 'farmer-market-cards',
  templateUrl: './farmer-market-cards.component.html',
  styleUrls: ['./farmer-market-cards.component.scss'],
})
export class FarmerMarketCardsComponent extends BaseComponent {
  public cards = [];
  public isUnfold = false;
  public indexCard: number;
  public isMobile: boolean;

  constructor(public injector: Injector, public routerSrv: RouterService) {
    super(injector);
    this.isMobile = this.domSrv.getIsDeviceSize();

    this.cards = [
      {
        img: '../../../../assets/icon/home/adopt-01.svg',
        title: 'page.adopt-a-tree-home.title',
        text: 'page.adopt-card-subtitle.body',
        linkText: 'page.visit-projects.title',
        section: 'ADOPTION',
      },
      {
        img: '../../../../assets/icon/home/buy-01.svg',
        title: 'page.buy-a-box-home.title',
        text: 'page.buy-card-subtitle.body',
        linkText: 'page.try-our-products.title',
        section: 'BOXES'
      },
    ];
  }

  unfold(i: number): void {
    this.isUnfold = !this.isUnfold;
    this.indexCard = i;
  }
}
