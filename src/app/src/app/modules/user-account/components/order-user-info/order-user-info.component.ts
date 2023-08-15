import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ORDER_DELIVERY_STATUS, ORDER_PAYMENT_STATUS } from '@app/constants/order.constants';
import { IAddress, ICountryIso } from '@app/interfaces';
import { CountryService } from '@app/services';

@Component({
  selector: 'cf-order-user-info',
  templateUrl: './order-user-info.component.html',
  styleUrls: ['./order-user-info.component.scss'],
})
export class OrderUserInfoComponent implements OnInit {
  @Input() orderPaymentStatus: string;
  @Input() orderDeliveryStatus: string;
  @Input() address: IAddress;
  @Input() addressTitle: string;
  @Input() btnText: string;

  @Output() changeDirection = new EventEmitter<Event>();

  countriesByIso: ICountryIso;

  isChangeDirection = false;

  constructor(private countrySrv: CountryService) {}

  ngOnInit(): void {
    void this.getCountries();
    this.getChangeDirection();
  }

  getChangeDirection(): void {
    this.isChangeDirection =
      this.orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_PENDING &&
      ![ORDER_PAYMENT_STATUS.ORDER_CANCELLED, ORDER_PAYMENT_STATUS.ORDER_REJECTED, ORDER_PAYMENT_STATUS.ORDER_DECLINED].includes(
        this.orderPaymentStatus as unknown as ORDER_PAYMENT_STATUS
      );
  }

  async getCountries(): Promise<void> {
    this.countriesByIso = await this.countrySrv.getCountriesByISO();
  }
}
