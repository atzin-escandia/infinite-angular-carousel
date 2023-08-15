import {Component, Injector, Input} from '@angular/core';
import {TranslocoService} from '@ngneat/transloco';
import {SUBSCRIPTION_STATUS} from '@constants/order.constants';
import {BaseComponent} from '@app/components';
import {IOrderStatusParams} from '../../interfaces/order.interface';

@Component({
  selector: 'subscription-box',
  templateUrl: './subscription-box.component.html',
  styleUrls: ['./subscription-box.component.scss'],
})
export class SubscriptionBoxComponent extends BaseComponent {
  @Input() title = 'global.recurrent-order.title';
  @Input() contentList;

  get orderStatusParams(): Partial<IOrderStatusParams> {
    const subscription = SUBSCRIPTION_STATUS.CANCELLED;

    return { subscription };
  }

  constructor(public injector: Injector, public translocoSrv: TranslocoService) {
    super(injector);
  }
}
