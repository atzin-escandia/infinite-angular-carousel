import { Component, Input } from '@angular/core';
import { IPurchaseCartAmount } from '../../../../interfaces';
import { TextService } from '../../../../services';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss'],
})
export class OrderSummaryComponent {
  @Input() totalToPay = 0;
  @Input() isGroupOrder = false;
  @Input() isGroupOrderPromoter: boolean;
  @Input() groupOrderAmount?: IPurchaseCartAmount;
  @Input() guestsNum?: number;

  get youPay(): number {
    return this.groupOrderAmount?.[this.isGroupOrderPromoter ? 'promoter' : 'guests'] || 0;
  }

  constructor(public textSrv: TextService) {}
}
