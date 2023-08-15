import {Component, OnInit} from '@angular/core';
import {PopupsInterface} from '../popups.interface';
import {PopupsRef} from '../popups.ref';
import {EventService, OrdersService, TextService, ProductService, UtilsService} from '../../services';

@Component({
  selector: 'banned-pay',
  templateUrl: './banned-pay.html',
  styleUrls: ['./banned-pay.scss']
})
export class BannedPayComponent implements OnInit {
  static className = 'BannedPayComponent';
  public orders: any = [];
  public dispute: any;

  constructor(
    public config: PopupsInterface,
    public popup: PopupsRef,
    public eventSrv: EventService,
    public orderSrv: OrdersService,
    public textSrv: TextService,
    public productSrv: ProductService,
    public utilsSrv: UtilsService
  ) { }

  async ngOnInit(): Promise<void> {
    const orderData = await this.orderSrv.getDisputed();

    orderData.map((order: any) => {
      const id: string = order._payment;
      let counter = 0;

      orderData.map((order2: any) => {
        if (id === order2._payment) {
          counter++;
        }
      });

      order.ordersByPayment = counter;
    });

    this.orders = orderData;
  }
}
