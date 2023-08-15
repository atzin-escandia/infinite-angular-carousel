import { Injectable } from '@angular/core';
import { PopupService } from '@app/services/popup';
import { CurrencyType } from '../../../../../constants/app.constants';
import { IAddress, IStorageLastPayment } from '../../../../../interfaces';
import {
  CartsService,
  EventService,
  LoaderService,
  LoggerService,
  PurchaseService,
  StorageService,
  TextService,
  UserService,
} from '../../../../../services';
import { IApplePayPaymentMethod } from '../../../interfaces/order.interface';
import { CheckoutCommonService } from '../../common/common.service';
import { CheckoutStripeIntentsControllerService } from '../../controllers';
import { CheckoutStoreService } from '../../store/checkout-store.service';
import { CheckoutPaymentCommonService } from '../common/common.service';

@Injectable()
export class CheckoutPaymentApplePayService extends CheckoutCommonService {
  constructor(
    public loaderSrv: LoaderService,
    public eventSrv: EventService,
    public userService: UserService,
    public purchaseSrv: PurchaseService,
    public cartsSrv: CartsService,
    public popupSrv: PopupService,
    public textSrv: TextService,
    public loggerSrv: LoggerService,
    public storageSrv: StorageService,
    public checkoutStoreSrv: CheckoutStoreService,
    private storeSrv: CheckoutStoreService,
    private checkoutPaymentCommonSrv: CheckoutPaymentCommonService,
    private checkoutStripeIntentsControllerSrv: CheckoutStripeIntentsControllerService
  ) {
    super(loaderSrv, eventSrv, userService, purchaseSrv, cartsSrv, popupSrv, textSrv, loggerSrv, storageSrv, checkoutStoreSrv);
  }

  getStripeIntent(currency: CurrencyType): Promise<stripe.paymentIntents.PaymentIntent> {
    return this.checkoutStripeIntentsControllerSrv.getCardPaymentIntent(currency);
  }

  async generateOrder(paymentMethod: IApplePayPaymentMethod, address: IAddress): Promise<void> {
    const cart = await this.checkoutPaymentCommonSrv.getCartAndValidate(this.storeSrv.currentIso);
    const orderData = this.checkoutPaymentCommonSrv.getOrderData(cart, address, paymentMethod, null, null);

    orderData.extra = {
      buttonId: this.checkoutPaymentCommonSrv.generateButtonId(),
      tabId: this.storageSrv.get('tabId', 2),
    };

    const orderResult: any = await this.purchaseSrv.order(orderData);

    this.saveLastPayment(cart, orderResult);

    const paymentId = orderResult?.payment?._id;

    paymentId && this.checkoutPaymentCommonSrv.onPaymentSuccess();
  }
}
