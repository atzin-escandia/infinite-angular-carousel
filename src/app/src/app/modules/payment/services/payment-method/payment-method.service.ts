import { Injectable } from '@angular/core';
import { IPaymentMethodMapToElem, IUserPaymentMethodCard, PAYMENT_METHOD, UserInterface } from '@app/interfaces';
import { ISelectedPaymentMethod } from '../../interfaces/payment.interface';
import { PopupService } from '@app/services/popup';
import { PaymentConfirmationPopupComponent } from '@app/popups/payment-confirmation-popup/payment-confirmation-popup';
import { EventService, UserService } from '@app/services';
import { Observable, firstValueFrom } from 'rxjs';
import * as dayjs from 'dayjs';

@Injectable()
export class PaymentMethodService {
  constructor(
    private popupSrv: PopupService,
    private userSrv: UserService,
    private eventSrv: EventService,
  ) {}

  getAvailablePaymentMethods(user: UserInterface): IPaymentMethodMapToElem[] {
    return this.paymentMethodsMapTo(user);
  }

  async confirmRemovePaymentMethod(method: IPaymentMethodMapToElem, user: UserInterface): Promise<UserInterface> {
    const canRemove = await firstValueFrom(this.popupSrv.open(PaymentConfirmationPopupComponent, {
      data: {
        title: 'page.delete-payment-method.body',
        body: `page.sure-delete-${method.type}.body`,
        confirm: 'global.accept.tab',
        canCancel: true,
      },
    }).onClose as Observable<boolean>);

    if (canRemove) {
      this.eventSrv.dispatchEvent('loading-animation', { set: true, isPage: true });

      try {
        const newUser = await this.removePaymentMethod(method.type, method.source.id, user);

        if (newUser) {
          this.userSrv.setOnStorage(newUser);

          return newUser;
        } else {
          return null;
        }
      } finally {
        this.eventSrv.dispatchEvent('loading-animation', { set: false, isPage: false });
      }
    }
  }

  private paymentMethodsMapTo(user: UserInterface): IPaymentMethodMapToElem[] {
    if (user && user.paymentMethods && user.paymentMethods[0]) {
      const paymentMethods = user.paymentMethods[0];
      const methods = ['cards', 'paypals'];

      if (paymentMethods.cards) {
        paymentMethods.cards = this.removeExpiredCards(paymentMethods.cards);
      }

      const mapTo = methods.map((methodName) => {
        if (paymentMethods[methodName]) {
          return paymentMethods[methodName]
            .filter((elem) => !elem.banned)
            .map((method) => ({
              ...method,
              type: methodName.slice(0, -1),
              source: method[`${methodName.slice(0, -1)}Info`],
            }))
            .map((method) => {
              delete method[method.type + 'Info'];

              return method;
            });
        }
      });

      return [].concat(...mapTo).filter((elem) => !!elem);
    }

    return [];
  }

  private removeExpiredCards(paymentMethodsCards: IUserPaymentMethodCard[]): IUserPaymentMethodCard[] {
    return paymentMethodsCards.filter((elem) => {
      const date = dayjs
        .utc()
        .month(elem.cardInfo.exp_month - 1)
        .year(elem.cardInfo.exp_year);

      if (!date.isBefore(dayjs.utc())) {
        return elem;
      }
    });
  }

  private async removePaymentMethod(type: PAYMENT_METHOD, sourceId: string, user: UserInterface): Promise<UserInterface> {
    const res = await this.userSrv.removePaymentMethod({ type, sourceId });

    return { ...user, paymentMethods: [res.paymentMethods] };
  }
}
