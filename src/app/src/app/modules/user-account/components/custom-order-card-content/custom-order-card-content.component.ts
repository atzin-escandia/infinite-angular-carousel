import { Component, Input } from '@angular/core';
import { OrderCustomBox } from '../../interfaces/order-custom-order.interface';
import { ArticleDTO } from '@app/modules/e-commerce/interfaces';
import { ImagesDTO } from '@app/components/images-mosaic/interfaces/images-dto';
import { TranslocoService } from '@ngneat/transloco';
import { CountryService, UtilsService } from '@app/services';
import { CFCurrencyPipe } from '@app/pipes/currency';
import { IOrderStatusParams } from '../../interfaces/order.interface';
import { ORDER_DELIVERY_STATUS } from '@app/constants/order.constants';

@Component({
  selector: 'cf-custom-order-card-content',
  templateUrl: './custom-order-card-content.component.html',
  styleUrls: ['./custom-order-card-content.component.scss'],
})
export class CustomOrderCardContentComponent {
  @Input() set order(newValue: OrderCustomBox) {
    this.orderData = newValue;
    this.setImages();
    this.price = this.getPriceLabel();
    this.setOrderStatus();
  }

  @Input() isFreeDelivery = false;
  @Input() isRecipient = false;

  orderData: OrderCustomBox;
  images: ImagesDTO[] = [];
  price: string;

  /**
   * orderStatusParams
   */
  orderStatusParams: IOrderStatusParams;
  orderDeliveryStatus = ORDER_DELIVERY_STATUS;

  constructor(public utilsSrv: UtilsService, private translocoSrv: TranslocoService, private countrySrv: CountryService) {}

  setImages(): void {
    this.images = this.orderData.products.length
      ? this.orderData.products[0].map((prod: ArticleDTO) => ({ src: prod.imgUrl, available: !prod.isUnavailable }))
      : [];
  }

  private getPriceLabel(): string {
    let label: string;

    if (this.isFreeDelivery) {
      label = this.translocoSrv.translate('global.free.text-info');
    } else if (this.isRecipient) {
      label = this.translocoSrv.translate('global.gift.text-info');
    }

    return label || this.getPrice();
  }
  private getPrice(): string {
    return new CFCurrencyPipe(this.countrySrv).transform(
      this.orderData?.amount?.totalToCollect,
      this.orderData.currency?.crowdfarmer.currency
    );
  }

  private setOrderStatus(): void {
    const { orderDeliveryStatus, orderPaymentStatus, orderTicketStatus, orderType } = this.orderData;
    let deliveryStatus: ORDER_DELIVERY_STATUS = orderDeliveryStatus;

    if (orderDeliveryStatus === this.orderDeliveryStatus.ORDER_PENDING) {
      deliveryStatus = this.orderDeliveryStatus.ORDER_LOGISTICS_INFO_SENT;
    }

    this.orderStatusParams = { orderDeliveryStatus: deliveryStatus, orderPaymentStatus, orderTicketStatus, orderType };
  }
}
