import { Component, Input } from '@angular/core';
import { TextService } from '@app/services';

@Component({
  selector: 'cf-payment-status',
  templateUrl: './payment-status.component.html',
  styleUrls: ['./payment-status.component.scss'],
})
export class PaymentStatusComponent {
  @Input() paymentStatusText: string;

  constructor(public textSrv: TextService) {}
}
