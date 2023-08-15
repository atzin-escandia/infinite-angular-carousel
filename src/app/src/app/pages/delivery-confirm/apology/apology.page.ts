import {Component, OnInit, Injector} from '@angular/core';
import {Subscription} from 'rxjs';
import {BasePage} from '@pages/base';
import {
  OrdersService
} from '@app/services';

@Component({
  selector: 'apology-page',
  templateUrl: './apology.page.html',
  styleUrls: ['./apology.page.scss']
})
export class ApologyPageComponent extends BasePage implements OnInit {
  public orderId: string;
  public paramSubscrip: Subscription;

  constructor(
    public injector: Injector, private ordersSrv: OrdersService
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    this.paramSubscrip = this.route.params.subscribe(params => {
      if (params && params.orderId) {
        this.orderId = params.orderId;
      }
    });

    const deliveryFeedbackInfo = {
      orderId: this.orderId,
      deliveryIssue: true,
    };

    await this.ordersSrv.deliveryFeedback(deliveryFeedbackInfo);

    this.setLoading(false);
    this.setInnerLoader(false, false);
  }

  goToOrder(): void {
    this.routerSrv.navigate('private-zone/my-order/info/' + this.orderId);
  }
}
