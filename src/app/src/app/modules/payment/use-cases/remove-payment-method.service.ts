import { Injectable } from '@angular/core';
import { IPaymentMethodMapToElem , UserInterface} from '@app/interfaces';
import { PaymentCommonService , PaymentMethodService} from '../services';
import { StatusPopupComponent } from '@app/popups/status-popup';
import { TranslocoService } from '@ngneat/transloco';
import { PAYMENT_METHODS_MAP_TO_TEXT } from '../payment.constants';

@Injectable()
export class RemovePaymentMethodUseCaseService extends PaymentCommonService {

  constructor(
    private translocoSrv: TranslocoService,
    private paymentMethodSrv: PaymentMethodService,
  ) {
    super();
  }

  async exec(
    item: IPaymentMethodMapToElem,
    user: UserInterface,
    selectedPaymentId: string
  ): Promise<{ newUser: UserInterface; isSelected: boolean }> {
    try {
      const newUser = await this.paymentMethodSrv.confirmRemovePaymentMethod(item, user);

      if (newUser) {
        this.setInnerLoader(true, true);

        this.popupSrv.open(StatusPopupComponent, {
          data: {
            msgSuccess: this.translocoSrv.translate(
              'notifications.succesfully-deleted-payment-method.text-info',
              { paymentMethod: this.translocoSrv.translate(PAYMENT_METHODS_MAP_TO_TEXT.get(item.type)) }
            ),
          },
        });

        return { newUser, isSelected: selectedPaymentId === item.source?.id };
      }

      return {} as any;
    } catch (err) {
      this.popupSrv.open(StatusPopupComponent, {
        data: {
          err: true,
          msgError: this.textSrv.getText('Operation not available'),
        },
      });

      throw err;
    } finally {
      this.setInnerLoader(false, false);
    }
  }
}
