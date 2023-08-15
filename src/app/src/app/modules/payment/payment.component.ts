import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  IAllowedPaymentMethods,
  INewCardData,
  IPaymentMethodMapToElem,
  IStripeRef,
  PAYMENT_METHOD,
  UnknownObjectType,
  UserInterface
} from '@app/interfaces';
import { ISelectedPaymentMethod } from './interfaces/payment.interface';
import { IAccordionOption } from '../purchase/interfaces/accordion-option.interface';
import { PaymentCommonService, PaymentMethodService, PaymentStripeService } from './services';
import { PaymentError } from './models/error.model';
import { IOrderPayment } from '@app/interfaces/order.interface';
import { PAYMENT_METHODS_MAP_TO_TEXT } from './payment.constants';
import { PaymentUseCasesManagerService } from './use-cases';
import { TranslocoService } from '@ngneat/transloco';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '@app/services';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {
  @Input() cart: UnknownObjectType[] = [];
  @Input() currentIso: string;
  @Input() amount: number;
  @Input() user: UserInterface;
  @Input() isPaymentMethodSelectorActive: boolean;
  @Input() selectedPaymentId: string;
  @Input() purchaseDataExtra: UnknownObjectType = {};
  @Input() isDiscoveryBox: boolean;

  get availablePaymentMethodsSort(): IPaymentMethodMapToElem[] {
    return this.selectedPaymentId ? this.sortAvailablePaymentMethods() : this.availablePaymentMethods;
  }

  @Input() set allowedPaymentMethods(allowedPaymentMethods: IAllowedPaymentMethods) {
    this._allowedPaymentMethods = allowedPaymentMethods || {} as any;

    if (allowedPaymentMethods) {
      Object.entries(allowedPaymentMethods).forEach(([paymentMethod, isAllowed]: [PAYMENT_METHOD, boolean]) => {
        if (isAllowed) {
          this.paymentMethodOpts.push({
            key: paymentMethod,
            label: this.translocoSrv.translate(PAYMENT_METHODS_MAP_TO_TEXT.get(paymentMethod))
          });
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

  @Output() isPaymentMethodSelectorActiveChange = new EventEmitter<boolean>();
  @Output() selectedPaymentIdChange = new EventEmitter<string>();
  @Output() payWithNewCard = new EventEmitter<IOrderPayment>();
  @Output() attachPaymentMethod = new EventEmitter<{ type: PAYMENT_METHOD; paymentMethodId: string }>();

  private _allowedPaymentMethods: IAllowedPaymentMethods = {} as any;

  stripe: stripe.Stripe;
  stripeRef = this.initStripeRef();
  paymentMethodOpts: IAccordionOption[] = [];
  availablePaymentMethods: IPaymentMethodMapToElem[] = [];
  card: stripe.elements.Element;
  fullListLength = false;

  get maxAvailablePaymentMethods(): IPaymentMethodMapToElem[] {
    return this.fullListLength
      ? this.availablePaymentMethods
      : this.availablePaymentMethods.length >= 2
      ? this.availablePaymentMethods.slice(0, 2)
      : this.availablePaymentMethods;
  }

  get selectedPaymentMethod(): IPaymentMethodMapToElem {
    return this.availablePaymentMethods?.find((elem) => elem.source.id === this.selectedPaymentId);
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userSrv: UserService,
    private translocoSrv: TranslocoService,
    private managerSrv: PaymentUseCasesManagerService,
    private paymentCommonSrv: PaymentCommonService,
    private paymentStripeSrv: PaymentStripeService,
    private paymentMethodSrv: PaymentMethodService,
  ) {}

  ngOnInit(): void {
    void this.initAsync();
  }

  async payCart(): Promise<IOrderPayment> {
    const selectedPaymentMethod = this.availablePaymentMethods.find((elem) => elem.source.id === this.selectedPaymentId);

    if (selectedPaymentMethod.type === PAYMENT_METHOD.CARD) {
      return this.payWithCard();
    } else if (selectedPaymentMethod.type === PAYMENT_METHOD.PAYPAL) {
      const payWithPayPalHandlerRes = await this.payWithPayPalHandler(this.selectedPaymentId);

      if (payWithPayPalHandlerRes) {
        const { intent, url } = payWithPayPalHandlerRes;

        return {
          type: PAYMENT_METHOD.PAYPAL,
          intent,
          payPalCallbackUrl: url
        };
      }
    }
  }

  protected togglePaymentMethodSelector(): void {
    this.isPaymentMethodSelectorActiveChange.emit(!this.isPaymentMethodSelectorActive);
  }

  onSelectedPaymentChange(item: IPaymentMethodMapToElem): void {
    this.selectedPaymentIdChange.emit(item.source.id);
  }

  async removePaymentMethodHandler(item: IPaymentMethodMapToElem): Promise<void> {
    try {
      const { newUser, isSelected } = await this.managerSrv.removePayment.exec(item, this.user, this.selectedPaymentId);

      this.setPaymentMethods(newUser);
      isSelected && this.selectedPaymentIdChange.emit(null);
    } catch (err) {
      this.paymentCommonSrv.logError(new PaymentError({
        name: 'PAYMENT_ERROR',
        message: 'Remove payment method error',
        cause: err,
      }));
    }
  }

  selectedPaymentMethodChangeHandler(paymentMethod: ISelectedPaymentMethod): void {
    console.log(paymentMethod);
  }

  async payWithNewCardHandler(data: INewCardData): Promise<void> {
    this.paymentCommonSrv.setInnerLoader(true, true);

    try {
      if (this.isDiscoveryBox) {
        const billingDetails: stripe.BillingDetails = {
          name: data.name,
          email: this.user.email
        };

        const paymentMethodId = await this.managerSrv.createPaymentMethod.exec({
          type: PAYMENT_METHOD.CARD,
          cardElement: data.card,
          billingDetails,
          currentIso: this.currentIso
        });

        this.attachPaymentMethod.emit({
          type: PAYMENT_METHOD.CARD,
          paymentMethodId
        });
      } else {
        const emitData = await this.managerSrv.newCardPayment.exec(
          this.cart,
          this.currentIso,
          this.amount,
          this.user.paymentMethods?.[0]?.id,
          this.selectedPaymentId,
          this.stripeRef.name,
          data
        );

        this.payWithNewCard.emit(emitData);
      }
    } catch (err) {
      this.paymentCommonSrv.setInnerLoader(false, false);
      this.paymentCommonSrv.displayGenericPopUp('stripe-error', err?.displayErrorMessage);
      this.paymentCommonSrv.logError(err);
    }
  }

  async payWithPayPalHandler(paymentMethodId?: string): Promise<{ intent: stripe.paymentIntents.PaymentIntent; url: string }> {
    this.paymentCommonSrv.setInnerLoader(true, true);

    try {
      if (this.isDiscoveryBox) {
        const path = window.location.href;
        const userId = this.user._id;
        const payPalReturnUrl = `${path}?profile_id=${userId}&set_fav=false&payment_type=paypal`;

        await this.managerSrv.createPaymentMethod.exec({ type: PAYMENT_METHOD.PAYPAL, payPalReturnUrl });
      } else {
        const { intent, url } = await this.managerSrv.payPalPayment.exec(
          this.cart,
          this.currentIso,
          this.amount,
          this.user.paymentMethods[0].id,
          paymentMethodId,
          this.purchaseDataExtra
        );

        return { intent, url };
      }
    } catch (err) {
      // TODO: Catch error
      console.error(err);
      this.paymentCommonSrv.setInnerLoader(false, false);
    }
  }

  private async initAsync(): Promise<void> {
    const queryParams = this.activatedRoute.snapshot.queryParams || {};
    const { profile_id, set_fav, redirect_status, setup_intent, setup_intent_client_secret, payment_type } = queryParams;
    const canCreatePayPal = this.canCreatePayPal({
      profile_id,
      set_fav,
      redirect_status,
      setup_intent,
      setup_intent_client_secret,
      payment_type
    });

    if (canCreatePayPal) {
      await this.createPayPal({
        profile_id,
        set_fav,
        redirect_status,
        setup_intent,
        setup_intent_client_secret
      });
    } else if (payment_type) {
      await this.router.navigateByUrl(window.location.pathname, { replaceUrl: true });
    }

    await this.setStripe();
    this.setPaymentMethods();
  }

  private async payWithCard(newCardData?: INewCardData): Promise<IOrderPayment> {
    return this.managerSrv.cardPayment.exec(
      this.cart,
      this.currentIso,
      this.amount,
      this.user.paymentMethods?.[0]?.id,
      this.selectedPaymentId,
      this.stripeRef.name,
      newCardData,
      this.selectedPaymentMethod.source
    );
  }

  private async setStripe(): Promise<void> {
    this.stripe = await this.paymentStripeSrv.init();
  }

  private setPaymentMethods(user: UserInterface = this.user): void {
    this.availablePaymentMethods = this.paymentMethodSrv.getAvailablePaymentMethods(user);

    if (this.availablePaymentMethods.length === 0) {
      this.isPaymentMethodSelectorActiveChange.emit(true);
    } else if (this.isDiscoveryBox) {
      this.availablePaymentMethods = this.availablePaymentMethods.filter(item => item.type === 'card');
    }
  }

  private initStripeRef(): IStripeRef {
    return {
      card: null,
      stripe: null,
      stripeSecret: null,
      name: null,
      type: null,
    };
  }

  private canCreatePayPal(params: {
    redirect_status: string;
    profile_id: string;
    set_fav: string;
    setup_intent: string;
    setup_intent_client_secret: string;
    payment_type: string;
  } = {} as any): boolean {
    const { redirect_status, profile_id, set_fav, setup_intent, setup_intent_client_secret, payment_type } = params;

    return redirect_status === 'succeeded' &&
      profile_id &&
      set_fav &&
      setup_intent &&
      setup_intent_client_secret &&
      payment_type === 'paypal';
  }

  private async createPayPal(params: {
    redirect_status: string;
    profile_id: string;
    set_fav: string;
    setup_intent: string;
    setup_intent_client_secret: string;
  } = {} as any): Promise<void> {
    const { redirect_status, profile_id, set_fav, setup_intent, setup_intent_client_secret } = params;

    try {
      const { paypalConfirm } = await this.userSrv.confirmPayPalAuth(
        profile_id,
        set_fav,
        redirect_status,
        setup_intent,
        setup_intent_client_secret
      );

      if (paypalConfirm) {
        this.attachPaymentMethod.emit({
          type: PAYMENT_METHOD.PAYPAL,
          paymentMethodId: paypalConfirm
        });
      } else {
        // TODO: Catch error
        throw new Error('confirmPayPalAuth error');
      }

    } catch (err) {
      // TODO: Catch error
      console.error(err);
      await this.router.navigateByUrl(window.location.pathname, { replaceUrl: true });
    }
  }

  private sortAvailablePaymentMethods(): IPaymentMethodMapToElem[] {
    return [
      this.availablePaymentMethods.find((elem) => elem.source.id === this.selectedPaymentId),
      ...this.availablePaymentMethods.filter((elem) => elem.source.id !== this.selectedPaymentId),
    ].filter((elem) => elem);
  }
}
