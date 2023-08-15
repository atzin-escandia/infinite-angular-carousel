import { Injectable } from '@angular/core';
import { PopupService } from '../../../../services/popup';
import { UserInterface } from '../../../../interfaces';
import { AllowedPaymentMethodName, IPaymentMethods } from '../../../../interfaces/payment-method.interface';
import {
  CartsService,
  EventService,
  LoaderService,
  LoggerService,
  PurchaseService,
  StorageService,
  TextService,
  UserService,
} from '../../../../services';
import { PaymentMethodsService } from '../../../../services/payment-methods/payment-methods.service';
import { IMsgCollapsableBox } from '../../interfaces/msg-collapsable-box.interface';
import { CheckoutCommonService } from '../common/common.service';
import { CheckoutStoreService } from '../store/checkout-store.service';
import { MAPTO_PAYMENT_METHOD } from '../../../../constants/payment.constants';
import { PurchaseError } from '../../models/error.model';

@Injectable()
export class CheckoutService extends CheckoutCommonService {
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
    private paymentMethodsSrv: PaymentMethodsService
  ) {
    super(loaderSrv, eventSrv, userService, purchaseSrv, cartsSrv, popupSrv, textSrv, loggerSrv, storageSrv, checkoutStoreSrv);
  }

  async setAllowedPaymentMethods(): Promise<void> {
    const isCardAllowedPromise = this._checkPaymentMethodAvailability('card');
    const isIdealAllowedPromise = this._checkPaymentMethodAvailability('Ideal');
    const isSepaAllowedPromise = this._checkPaymentMethodAvailability('SEPA');
    const isPaypalAllowedPromise = this._checkPaymentMethodAvailability('PayPal');

    const [isCardAllowed, isIdealAllowed, isSepaAllowed, isPaypalAllowed] = await Promise.all([
      isCardAllowedPromise,
      isIdealAllowedPromise,
      isSepaAllowedPromise,
      isPaypalAllowedPromise,
    ]);

    this.setAllowedPaymentMethodsOnStore(isCardAllowed, isIdealAllowed, isSepaAllowed, isPaypalAllowed);
  }

  msgCollapsableBoxInit(limit: number): IMsgCollapsableBox {
    return { active: false, text: '', limit, remainingWords: limit };
  }

  handleOrderMsgs(shipperMsgParams: IMsgCollapsableBox, dedicatoryMsgParams: IMsgCollapsableBox): void {
    this._hanldeShipperMsg(shipperMsgParams);
    this._hanldeDedicatoryMsg(dedicatoryMsgParams);
  }

  setAllowedPaymentMethodsOnStore(card: boolean, ideal: boolean, sepa: boolean, paypal: boolean): void {
    const { isGroupOrder } = this.checkoutStoreSrv;

    this.checkoutStoreSrv.setAllowedPaymentMethods({
      card,
      ideal: isGroupOrder ? false : ideal,
      sepa: isGroupOrder ? false : sepa,
      paypal: isGroupOrder ? false : paypal,
    });
  }

  checkUserPaymentMethodsOnInit(user: UserInterface): void {
    const paymentMethods = [
      { primaryKey: 'cards', secondaryKey: 'cardInfo' },
      { primaryKey: 'ideals', secondaryKey: 'idealInfo' },
      { primaryKey: 'sepas', secondaryKey: 'sepaInfo' },
      { primaryKey: 'paypals', secondaryKey: 'paypalInfo' },
    ];

    const userPms = user.paymentMethods[0];

    const userPmsMap = {
      ...(userPms.cards && { cards: userPms.cards }),
      ...(userPms.ideals && { ideals: userPms.ideals }),
      ...(userPms.sepas && { sepas: userPms.sepas }),
      ...(userPms.paypals && { paypals: userPms.paypals }),
    };

    this._tryToSetSelectedPaymentMethod(paymentMethods, userPmsMap);
  }

  updateCart(sectionIdx: number): void {
    const cart = this.cartsSrv.get();
    const page = this.checkoutStoreSrv.cartSections[sectionIdx];

    this.cartsSrv.update(cart, page);
  }

  getLSOrderData(): {
    shipperMsg: string;
    dedicatoryMsg: string;
    selectedUserAddressId: string;
    usedCredits: number;
  } {
    return {
      shipperMsg: localStorage.getItem('shipperMsg'),
      dedicatoryMsg: localStorage.getItem('dedicatoryMsg'),
      selectedUserAddressId: localStorage.getItem('selectedUserAddressId'),
      usedCredits: Number(localStorage.getItem('usedCredits')),
    };
  }

  saveOrderDataBeforeRedirect(): void {
    const { shipperMsg, dedicatoryMsg, selectedUserAddressId, creditsToSpend } = this.checkoutStoreSrv;

    localStorage.setItem('shipperMsg', shipperMsg);
    localStorage.setItem('dedicatoryMsg', dedicatoryMsg);
    localStorage.setItem('selectedUserAddressId', selectedUserAddressId);
    localStorage.setItem('usedCredits', String(creditsToSpend));
  }

  clearOrderDataAfterRedirectSuccess(): void {
    localStorage.removeItem('shipperMsg');
    localStorage.removeItem('dedicatoryMsg');
    localStorage.removeItem('selectedUserAddressId');
    localStorage.removeItem('usedCredits');
  }

  private async _checkPaymentMethodAvailability(paymentMethodName: AllowedPaymentMethodName): Promise<boolean> {
    try {
      const isAvailable = await this.paymentMethodsSrv.checkCountryPaymentMethodAvailability(
        paymentMethodName,
        this.checkoutStoreSrv.currentIso
      );

      return isAvailable;
    } catch (err) {
      this.logError(new PurchaseError({
        name: 'UNEXPECTED_ERROR',
        message: `Get ${paymentMethodName} payment method availability error`,
        cause: err,
      }));

      return false;
    }
  }

  private _hanldeShipperMsg(msgParams: IMsgCollapsableBox): void {
    const shipperMsg = msgParams.active && msgParams.text.trim().length > 0 ? msgParams.text : null;

    this.checkoutStoreSrv.setShipperMsg(shipperMsg);
  }

  private _hanldeDedicatoryMsg(msgParams: IMsgCollapsableBox): void {
    const dedicatoryMsg = msgParams.active && msgParams.text.trim().length > 0 ? msgParams.text : null;

    this.checkoutStoreSrv.setDedicatoryMsg(dedicatoryMsg);
  }

  private _tryToSetSelectedPaymentMethod(pms: { primaryKey: string; secondaryKey: string }[], userPms: IPaymentMethods): void {
    try {
      pms.forEach((pm) => {
        const pmKey = MAPTO_PAYMENT_METHOD.PAYMENT_INFO_KEY.get(pm.secondaryKey);
        const isAllowed = this.checkoutStoreSrv.allowedPaymentMethods[pmKey];

        if (isAllowed) {
          const favPm = userPms[pm.primaryKey]?.find((elem) => elem.favourite);

          if (favPm) {
            this.checkoutStoreSrv.setSelectedPaymentMethod({
              type: pmKey,
              source: favPm[pm.secondaryKey],
            });
          } else if (!this.checkoutStoreSrv.selectedPaymentMethod && userPms[pm.primaryKey]?.length) {
            this.checkoutStoreSrv.setSelectedPaymentMethod({
              type: MAPTO_PAYMENT_METHOD.PAYMENT_INFO_KEY.get(pm.secondaryKey),
              source: userPms[pm.primaryKey][0][pm.secondaryKey],
            });
          }
        }
      });
    } catch (err) {
      this.logError(err);
    }
  }
}
