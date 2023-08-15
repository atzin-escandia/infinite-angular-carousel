import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IPaymentMethodMapToElem } from '../../../../interfaces/payment-method.interface';
import { TextService } from '../../../../services';

@Component({
  selector: 'user-payment-card',
  templateUrl: './user-payment-card.component.html',
  styleUrls: ['./user-payment-card.component.scss'],
})
export class UserPaymentCardComponent {
  @Input() paymentMethod: IPaymentMethodMapToElem;
  @Input() isOptionSelected: boolean;
  @Input() selectable = false;

  @Output() optionSelectedChange = new EventEmitter();
  @Output() removePaymentMethod = new EventEmitter();

  get cardTitle(): string {
    const { type } = this.paymentMethod;
    const { funding } = this.paymentMethod?.source || {};

    const cardTitle = {
      card: this.textSrv.getText(funding === 'credit' ? 'page.Credit-card.body' : 'page.debit-card.title'),
      sepa: this.textSrv.getText('global.sepa-account.form'),
      paypal: this.textSrv.getText('global.paypal-account.label'),
      ideal: this.textSrv.getText('page.ideal-account.title'),
    };

    return cardTitle[type] || '';
  }

  constructor(public textSrv: TextService) {}

  selectPaymentHandler(): void {
    this.optionSelectedChange.emit();
  }

  removePaymentHandler(): void {
    this.removePaymentMethod.emit();
  }
}
