import { Component, Input, Injector, Output, EventEmitter } from '@angular/core';
import { OrdersService, RouterService } from '@app/services';
import { BaseComponent } from '@app/components';
import { ISubscriptionOrderCard } from '@interfaces/subscription.interface';

@Component({
  selector: 'subscription-card',
  templateUrl: './subscription-card.component.html',
  styleUrls: ['./subscription-card.component.scss'],
})
export class SubscriptionCardComponent extends BaseComponent {
  @Input() public minVersion = false;
  @Input() public app = false;
  @Input() subscription: ISubscriptionOrderCard;

  @Output() public detailInUp = new EventEmitter<string>();

  get orderStatusParams(): any {
    const subscription = this.subscription.status;

    return { subscription };
  }

  constructor(public injector: Injector, public ordersSrv: OrdersService, private routerSrv: RouterService) {
    super(injector);
  }

  public openSubscriptionDetail(id: string): void {
    this.routerSrv.navigate(`/private-zone/my-order/subscription-info/${id}`);
  }
}
