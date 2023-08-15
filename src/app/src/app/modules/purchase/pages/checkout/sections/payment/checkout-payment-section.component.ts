/// <reference types="stripe-v3" />
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  INewCard,
  INewCardData,
  IAllowedPaymentMethods,
  IPaymentMethodMapToElem,
} from '@interfaces/payment-method.interface';
import { StatusPopupComponent } from '@popups/status-popup';
import { CountryService, StorageService, TextService, TrackingConstants, UserService } from '@app/services';
import { PopupService } from '@services/popup';
import { PAYMENT_METHOD } from '../../../../constants/payment-method.constants';
import { IAccordionOption } from '../../../../interfaces/accordion-option.interface';
import { PurchaseCoreService } from '../../../../services/purchase.service';
import { PaymentConfirmationPopupComponent } from '@popups/payment-confirmation-popup/payment-confirmation-popup';
import { IAddress, IPurchaseInfo, IPurchaseInfoTotalToPay } from '@app/interfaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslocoService } from '@ngneat/transloco';
import { PurchaseError } from '@app/modules/purchase/models/error.model';
import { IMPACT_MESSAGES_PAGE } from '@app/modules/purchase/constants/impact-messages.constants';
import { ImpactMessagesService } from '@app/services/impact-messages/impact-messages.service';

@Component({
  selector: 'checkout-payment-section',
  templateUrl: './checkout-payment-section.component.html',
  styleUrls: ['./checkout-payment-section.component.scss'],
})
export class CheckoutPaymentSectionComponent implements OnInit {
  @Input() set availablePaymentMethods(availablePaymentMethods: IPaymentMethodMapToElem[]) {
    this._availablePaymentMethods = availablePaymentMethods || [];

    if (this.availablePaymentMethods.length === 0) {
      this.isPaymentMethodSelectorActive = true;
    }
  }

  get availablePaymentMethods(): IPaymentMethodMapToElem[] {
    return this.purchaseCoreSrv.store.selectedPaymentMethod ? this.sortAvailablePaymentMethods() : this._availablePaymentMethods;
  }

  @Input() set selectedPaymentMethod(selectedPaymentMethod: { type: PAYMENT_METHOD; source: any }) {
    this.selectedPaymentMethodId = selectedPaymentMethod?.source?.id;
  }

  get maxAvailablePaymentMethods(): IPaymentMethodMapToElem[] {
    return this.fullListLength
      ? this.availablePaymentMethods
      : this.availablePaymentMethods.length >= 2
      ? this.availablePaymentMethods.slice(0, 2)
      : this.availablePaymentMethods;
  }

  private paymentMethodsMapToText: Map<PAYMENT_METHOD, string> = new Map([
    [PAYMENT_METHOD.CARD, this.translocoSrv.translate('page.Credit-card.body')],
    [PAYMENT_METHOD.IDEAL, this.translocoSrv.translate('page.ideal-account.title')],
    [PAYMENT_METHOD.SEPA, this.translocoSrv.translate('page.bank-account.button')],
    [PAYMENT_METHOD.PAYPAL, this.translocoSrv.translate('global.paypal-account.label')],
    [PAYMENT_METHOD.KLARNA, this.translocoSrv.translate('global.pay-klarna.title')],
  ]);

  @Input() set allowedPaymentMethods(allowedPaymentMethods: IAllowedPaymentMethods) {
    this._allowedPaymentMethods = allowedPaymentMethods || ({} as any);

    if (allowedPaymentMethods && typeof allowedPaymentMethods === 'object') {
      Object.entries(allowedPaymentMethods)
        .filter(([paymentMethod]) => paymentMethod !== 'applePay')
        .forEach(([paymentMethod, isAllowed]: [PAYMENT_METHOD, boolean]) => {
          if (isAllowed) {
            this.paymentMethodOpts.push({ key: paymentMethod, label: this.paymentMethodsMapToText.get(paymentMethod) });
          } else {
            const optIdx = this.paymentMethodOpts.findIndex((elem) => elem.key === paymentMethod);

            this.paymentMethodOpts = this.paymentMethodOpts.filter((_, i) => i !== optIdx);
          }
        });
    }
  }

  get allowedPaymentMethods(): IAllowedPaymentMethods {
    return this._allowedPaymentMethods;
  }

  @Input() stripeRef: any;
  @Input() isGroupOrder: boolean;
  @Input() isAnyProductSubscriptionActive: boolean;
  @Input() countriesByIso: string;
  @Input() finalPrice: number;
  @Input() isGroupOrderGuestPaymentMode: boolean;
  @Input() displayKlarnaAdvertising: boolean;

  @Output() changeSection = new EventEmitter();
  @Output() payCart = new EventEmitter<{ stripeIntent: stripe.paymentIntents.PaymentIntent }>();
  @Output() payWithNewCard = new EventEmitter<INewCard>();
  @Output() payWithNewPayPal = new EventEmitter();
  @Output() payWithNewKlarna = new EventEmitter();

  private _availablePaymentMethods: IPaymentMethodMapToElem[] = [];
  private _allowedPaymentMethods: IAllowedPaymentMethods = {} as any;
  private stripeIntent: stripe.paymentIntents.PaymentIntent;
  private showPopupAfterStripeIntent = false;
  public selectedPaymentMethodId: string;
  public paymentMethodOpts: IAccordionOption[] = [];
  public isPaymentMethodSelectorActive = false;
  public fullListLength = false;
  public promoterAssumesPayment = true;
  public guestsNum = 1;
  public lastPayDay: string;
  public loadingSplitPrice = false;
  public purchaseInfo?: IPurchaseInfo;
  public purchaseInfoAddress?: IAddress;

  get $groupOrderTotal(): Observable<IPurchaseInfoTotalToPay> {
    return this.purchaseCoreSrv.store.cart$.pipe(map((res) => res?.total));
  }

  constructor(
    public purchaseCoreSrv: PurchaseCoreService,
    public textSrv: TextService,
    private popupSrv: PopupService,
    private userSrv: UserService,
    private countrySrv: CountryService,
    private translocoSrv: TranslocoService,
    private impactMessagesSrv: ImpactMessagesService,
    public storageSrv: StorageService
  ) {}

  ngOnInit(): void {
    void this._checkGroupOrder();
  }

  private async _checkGroupOrder(): Promise<void> {
    if (this.purchaseCoreSrv.store.isGroupOrderGuestPaymentMode) {
      this.purchaseInfo = this.purchaseCoreSrv.store.purchaseInfo;
      this.purchaseInfoAddress = this.purchaseCoreSrv.store.purchaseInfo.cart.address;
    } else {
      const { isGroupOrderAvailable, isGroupOrder } = this.purchaseCoreSrv.store;

      if (isGroupOrderAvailable && isGroupOrder) {
        try {
          this.purchaseCoreSrv.common.setInnerLoader(true, true);
          this.purchaseCoreSrv.store.cart ? await this.setGroupOrderCart() : await this.purchaseCoreSrv.groupOrder.setCart();
          this.promoterAssumesPayment = this.purchaseCoreSrv.store.cart?.promoterAssumesPayment || true;
          this.guestsNum = this.purchaseCoreSrv.store.cart?.guestsLimit || 1;
          this.lastPayDay = this.purchaseCoreSrv.store.cart?.lastPayDay;
        } catch (err) {
          this.purchaseCoreSrv.common.logError(err);
          this.purchaseCoreSrv.checkoutAnalyticsSrv.trackGA4Analytics(TrackingConstants.GTM4.CHECKOUT_KO_CODE);
        } finally {
          this.purchaseCoreSrv.common.setInnerLoader(false, false);
        }
      }
    }
  }

  private async setGroupOrderCart(): Promise<void> {
    try {
      this.loadingSplitPrice = true;
      const cart = await this.purchaseCoreSrv.groupOrder.handleGroupOrderOnPaymentSection(this.promoterAssumesPayment, this.guestsNum);

      this.purchaseCoreSrv.store.setCart(cart);
      this.loadingSplitPrice = false;
    } catch (err) {
      this.loadingSplitPrice = false;

      throw new PurchaseError({
        name: 'GROUP_ORDER_ERROR',
        message: 'Group Order set cart error',
      });
    }
  }

  sortAvailablePaymentMethods(): IPaymentMethodMapToElem[] {
    return [
      this._availablePaymentMethods.find((elem) => elem.source.id === this.purchaseCoreSrv.store.selectedPaymentMethod?.source?.id),
      ...this._availablePaymentMethods.filter((elem) => elem.source.id !== this.purchaseCoreSrv.store.selectedPaymentMethod?.source?.id),
    ].filter((elem) => elem);
  }

  public async onSelectedPaymentChange(item: IPaymentMethodMapToElem): Promise<void> {
    try {
      this.showPopupAfterStripeIntent = false;

      const selectedPaymentMethodId = item.source.id;

      if (selectedPaymentMethodId) {
        await this._setStripeIntent(selectedPaymentMethodId);
      }

      this.purchaseCoreSrv.store.setSelectedPaymentMethod({ type: item.type, source: item.source });
    } catch (err) {
      this.purchaseCoreSrv.common.logError(err, 'Set stripe intent on selected payment method change error');
    }
  }

  removePaymentMethodHandler(method: IPaymentMethodMapToElem): void {
    return this.popupSrv
      .open(PaymentConfirmationPopupComponent, {
        data: {
          title: 'page.delete-payment-method.body',
          body: `page.sure-delete-${method.type}.body`,
          confirm: 'global.accept.tab',
          canCancel: true,
        },
      })
      .onClose.subscribe(async (result) => {
        if (result) {
          this.purchaseCoreSrv.common.setInnerLoader(true, true);

          try {
            await this.removePaymentMethod(method.type, method.source.id);
          } catch (err) {
            this.purchaseCoreSrv.common.logError(err);
          } finally {
            this.purchaseCoreSrv.common.setInnerLoader(false, false);
          }
        }
      });
  }

  private async removePaymentMethod(type: PAYMENT_METHOD, sourceId: string): Promise<any> {
    try {
      const res = await this.userSrv.removePaymentMethod({ type, sourceId });

      this.purchaseCoreSrv.payments.common.onRemovePaymentMethod(res.paymentMethods, sourceId);

      this.popupSrv.open(StatusPopupComponent, {
        data: {
          msgSuccess: this.textSrv.getText('{paymentMethod} successfuly deleted', { '{paymentMethod}': type }),
        },
      });
    } catch (error) {
      this.popupSrv.open(StatusPopupComponent, {
        data: {
          err: true,
          msgError: this.textSrv.getText('Operation not available'),
        },
      });

      throw new PurchaseError({
        name: 'CHECKOUT_SECTION_PAYMENT_ERROR',
        message: 'Remove payment method error',
        cause: error,
      });
    }
  }

  togglePaymentMethodSelector(): void {
    this.isPaymentMethodSelectorActive = !this.isPaymentMethodSelectorActive;
  }

  public async onNewPaymentMethod(data: { type: PAYMENT_METHOD; methodId: string; setAsFavorite: boolean }): Promise<void> {
    const user = await this.userSrv.get(true);

    this.purchaseCoreSrv.store.setUser(user);
    this.showPopupAfterStripeIntent = data.setAsFavorite;
    this.purchaseCoreSrv.payments.common.setPaymentMethods(data.methodId);
    this.purchaseCoreSrv.common.setInnerLoader(false, false);
    this.isPaymentMethodSelectorActive = false;
  }

  goBack(): void {
    this.changeSection.emit();
  }

  async onPay(): Promise<void> {
    this.setImpactMessages();
    if (this.selectedPaymentMethodId || this.finalPrice <= 0) {
      if (!this.stripeIntent && this.selectedPaymentMethodId) {
        try {
          await this._setStripeIntent();
        } catch (err) {
          this.purchaseCoreSrv.common.logError(err, 'Set stripe intent on pay error');
        }
      }

      this.payCart.emit({ stripeIntent: this.stripeIntent });
    }
  }

  private setImpactMessages(): void {
    try {
      this.impactMessagesSrv.isImActive(IMPACT_MESSAGES_PAGE.CHECKOUT_LOADER).subscribe(() => {
        const impactMessage = this.impactMessagesSrv.getImpactMessage(
          IMPACT_MESSAGES_PAGE.CHECKOUT_LOADER,
          this.purchaseCoreSrv.store.products
        );

        this.storageSrv.set('impactMessage', impactMessage);
      });
    } catch (err) {
      return;
    }
  }

  public payWithPaypalHandler(): void {
    this.setImpactMessages();
    this.payWithNewPayPal.emit();
  }

  public payWithKlarnaHandler(): void {
    this.setImpactMessages();
    this.payWithNewKlarna.emit();
  }

  payWithCardHandler(data: INewCardData): void {
    this.setImpactMessages();
    const currentCountry = this.countrySrv.getCurrentCountry();

    this.payWithNewCard.emit({ currency: currentCountry.currency, data });
  }

  guestsNumChangeHandler(guestsNum: number): void {
    this.guestsNum = guestsNum;
    void this.setGroupOrderCart();
  }

  promoterAssumesPaymentChangeHandler(val: boolean): void {
    this.promoterAssumesPayment = val;
    void this.setGroupOrderCart();
  }

  private async _setStripeIntent(selectedPaymentMethodId: string = this.selectedPaymentMethodId): Promise<void> {
    try {
      const stripeIntent = await this.purchaseCoreSrv.controllers.stripeIntents.handleStripeIntent(
        selectedPaymentMethodId,
        this.availablePaymentMethods,
        this.showPopupAfterStripeIntent
      );

      this._setStripeIntentValue(stripeIntent);
    } catch (err) {
      this._setStripeIntentValue(null);

      throw new PurchaseError({
        name: 'CHECKOUT_SECTION_PAYMENT_ERROR',
        message: 'Set stripe intent error',
        cause: err,
      });
    }
  }

  private _setStripeIntentValue(value: stripe.paymentIntents.PaymentIntent): void {
    this.stripeIntent = value;
    this.purchaseCoreSrv.store.setLastPaymentIntent(value);
  }
}
