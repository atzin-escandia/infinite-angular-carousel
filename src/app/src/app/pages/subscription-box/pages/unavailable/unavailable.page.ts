import { CommonModule } from '@angular/common';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { SharedModule } from '@app/modules/shared/shared.module';
import { RouterService } from '@app/services';
import { DEFAULT_UNAVAILABLE_IMG } from '../../constants/subscription-box.constants';
import { BasePage } from '@app/pages/base';

const BOXES_URL = 'BOXES';

@Component({
  selector: 'subscription-box-unavailable-page',
  templateUrl: './unavailable.page.html',
  styleUrls: ['./unavailable.page.scss'],
  imports: [SharedModule, CommonModule],
  standalone: true,
})
export class SubscriptionBoxUnavailablePageComponent extends BasePage implements OnInit {
  @Input() urlImage = DEFAULT_UNAVAILABLE_IMG;

  constructor(public injector: Injector, private routerSvr: RouterService) {
    super(injector);
  }

  ngOnInit(): void {
    this.setInnerLoader(false, false);
  }

  goToFarmersMarket(): void {
    this.routerSvr.navigateToFarmersMarket(BOXES_URL);
  }
}
