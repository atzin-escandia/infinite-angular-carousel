import { Injectable } from '@angular/core';
import { INewCardData, UnknownObjectType } from '@app/interfaces';
import { CardPaymentUseCaseService } from './card-payment.service';
import { IOrderPayment } from '@app/interfaces/order.interface';

@Injectable()
export class NewCardPaymentUseCaseService {
  constructor(private cardPaymentUseCaseSrv: CardPaymentUseCaseService) {}

  async exec(
    cart: UnknownObjectType[],
    currentIso: string,
    amount: number,
    customerId: string,
    selectedPaymentId: string,
    name: string,
    newCardData: INewCardData,
  ): Promise<IOrderPayment> {
    const orderPayment = await this.cardPaymentUseCaseSrv.exec(
      cart,
      currentIso,
      amount,
      customerId,
      selectedPaymentId,
      name,
      newCardData
    );

    return orderPayment;
  }
}
