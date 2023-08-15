import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TextService } from '../../../../services';
import { PopupService } from '../../../../services/popup';
import { CheckoutService } from '../../services/checkout/checkout.service';
import { IPurchaseInfoTotalToPay } from '../../../../interfaces/group-order.interface';
import { PaymentConfirmationPopupComponent } from '../../../../popups/payment-confirmation-popup/payment-confirmation-popup';
import { TranslocoService } from '@ngneat/transloco';
import dayjs from 'dayjs';

@Component({
  selector: 'app-split-payment',
  templateUrl: './split-payment.component.html',
  styleUrls: ['./split-payment.component.scss'],
})
export class SplitPaymentComponent {
  @Input() groupOrderTotal: IPurchaseInfoTotalToPay;
  @Input() guestsNum: number;
  @Input() promoterAssumesPayment: boolean;
  @Input() loadingSplitPrice: boolean;
  @Input() lastPayDay: string;

  @Output() guestsNumChange = new EventEmitter<number>();
  @Output() promoterAssumesPaymentChange = new EventEmitter<boolean>();

  showTooltip = false;

  constructor(
    public textSrv: TextService,
    public checkoutSrv: CheckoutService,
    private popupSrv: PopupService,
    private translocoSrv: TranslocoService
  ) {}

  onQuantityChange(val: number): void {
    const guestsNum = this.guestsNum + val;

    this.guestsNumChange.emit(guestsNum);
  }

  promoterFullPaymetCheckOnChange(isChecked: boolean): void {
    this.promoterAssumesPaymentChange.emit(isChecked);
  }

  moreInfoCheckboxClick(): void {
    const timeRemaining = this.getTimeRemaining();

    this.popupSrv.open(PaymentConfirmationPopupComponent, {
      data: {
        title: this.translocoSrv.translate('notifications.promoter-assumes-full-payment.title'),
        isBodyHTML: true,
        body: this.translocoSrv.translate('notifications.promoter-assumes-full-payment.body', { timeRemaining }),
        confirm: this.translocoSrv.translate('global.understood.button'),
      },
    });
  }

  private getTimeRemaining(): string {
    const finalDay = dayjs(this.lastPayDay);
    const timeRemaining = finalDay.diff(dayjs(), 'minutes');
    const minutesRemaining = Math.floor(timeRemaining % 60);
    const hoursRemaining = Math.floor(timeRemaining / 60);

    return `${hoursRemaining}h ${minutesRemaining}m`;
  }
}
