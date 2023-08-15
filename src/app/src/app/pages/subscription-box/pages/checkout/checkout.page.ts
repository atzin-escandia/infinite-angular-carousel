import { CommonModule } from '@angular/common';
import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IAddress, IStorageLastPayment, PAYMENT_METHOD, UserInterface } from '@app/interfaces';
import { PaymentComponent } from '@app/modules/payment/payment.component';
import { PaymentModule } from '@app/modules/payment/payment.module';
import { PurchaseComponentsModule } from '@app/modules/purchase/components/components.module';
import { SharedModule } from '@app/modules/shared/shared.module';
import { ShipmentModule } from '@app/modules/shipment/shipment.module';
import { BasePage } from '@app/pages/base';
import { BoxSubscription, SubscriptionPlan } from '@app/pages/subscription-box/interfaces/subscription-box.interface';
import { AuthService, StateService } from '@app/services';
import { Observable, Subject, catchError, combineLatest, of, switchMap, takeUntil, tap } from 'rxjs';
import { NOT_VALID_COUNTRY_ERROR, SB_ALLOWED_PAYMENT_METHODS } from '../../constants/subscription-box.constants';
import { SubscriptionBoxService } from '../../services';

@Component({
  selector: 'subscription-box-checkout-page',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  imports: [SharedModule, ShipmentModule, CommonModule, PaymentModule, PurchaseComponentsModule],
  standalone: true,
})
export class SubscriptionBoxCheckoutPageComponent extends BasePage implements OnInit, OnDestroy {
  @ViewChild('paymentCmp') paymentCmp: PaymentComponent;

  plan: SubscriptionPlan;
  user: UserInterface;
  addresses: IAddress[] = [];
  selectedAddress: IAddress;
  selectedPaymentId: string;
  editingAddress = false;
  canDisplayContent = false;
  isPaymentMethodSelectorActive = false;
  destroy$ = new Subject<void>();
  planSubject$ = new Subject<void>();
  plan$: Observable<SubscriptionPlan> = this.getPlan$();
  currentLangIso$ = this.langSrv.currentLangIso$;

  readonly allowedPaymentMethods = SB_ALLOWED_PAYMENT_METHODS;

  get selectedAddressId(): string {
    return this.selectedAddress?.id as string;
  }

  get isPaymentButtonEnabled(): boolean {
    return !!this.selectedPaymentId && !!this.selectedAddressId;
  }

  constructor(
    public injector: Injector,
    public authService: AuthService,
    private stateSrv: StateService,
    private subscriptionBoxService: SubscriptionBoxService
  ) {
    super(injector);
    this.plan$.pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnInit(): void {
    this.setInnerLoader(true, true);

    if (this.authService.isLogged()) {
      void this.initAsync();
    } else {
      this.routerSrv.navigate('login-register');
    }
  }

  onSelectedAddressChangeHandler(address: IAddress): void {
    this.storageSrv.set('selectedAddress', address);
    this.selectedAddress = address;
  }

  addressesOnChangeHandler(address: IAddress): void {
    this.editingAddressHandler(false);
    this.storageSrv.set('selectedAddress', address);
    this.selectedAddress = address;
  }

  editingAddressHandler(editing: boolean): void {
    this.editingAddress = editing;
  }

  selectedPaymentIdChangeHandler(paymentId: string): void {
    this.selectedPaymentId = paymentId;
  }

  async attachPaymentMethodHandler({ type, paymentMethodId }: { type: PAYMENT_METHOD; paymentMethodId: string }): Promise<void> {
    this.setInnerLoader(true, true);

    try {
      type === PAYMENT_METHOD.CARD && (await this.userService.addCreditCard(paymentMethodId, this.countrySrv.getCountry()));
      await this.onPay(paymentMethodId, false);
    } catch (err) {
      this.subscriptionBoxService.showErrorToast();
      this.setInnerLoader(false, false);
    }
  }

  async onPay(paymentMethodId: string = this.selectedPaymentId, displayLoader: boolean = true): Promise<void> {
    displayLoader && this.setInnerLoader(true, true);

    try {
      const body: BoxSubscription = {
        planId: this.plan.planId,
        paymentMethodId,
        shipmentAddress: this.selectedAddress,
      };

      const user = await this.userService.get();

      this.subscriptionBoxService
        .postSubscription(body, user._id)
        .pipe(
          catchError((err) => {
            this.subscriptionBoxService.showErrorToast();
            this.setInnerLoader(false, false);
            throw err;
          })
        )
        .subscribe(() => {
          const lastPaymentData: IStorageLastPayment = {
            products: [],
            cart: [],
            address: this.selectedAddress,
            price: this.plan.price,
            discoveryBox: this.plan.boxes[this.plan.nextBox],
          };

          this.storageSrv.set('lastPayment', lastPaymentData);
          this.storageSrv.clear('selectedAddress');
          this.setInnerLoader(false, false);
          this.routerSrv.navigate('subscription-box/success');
        });
    } catch (err) {
      this.subscriptionBoxService.showErrorToast();
      console.error(err);
      this.setInnerLoader(false, false);
    }
  }

  private async initAsync(): Promise<void> {
    try {
      this.user = await this.userService.get(true);
      this.addresses = this.user.addresses || [];
      const countryIso = this.countrySrv.getCountry();

      this.selectedAddress = this.storageSrv.get('selectedAddress') || this.addresses.find((elem) => elem.country === countryIso);
    } catch (err) {
      this.subscriptionBoxService.showErrorToast();
      console.error(err);
    } finally {
      this.planSubject$.next();
      this.canDisplayContent = true;
    }
  }

  private getPlan$(): Observable<SubscriptionPlan> {
    const currentCountry$ = this.stateSrv.$currentCountry;

    return combineLatest([this.planSubject$, currentCountry$]).pipe(
      switchMap(([, countryIso]) =>
        this.subscriptionBoxService.getSinglePlan(countryIso).pipe(
          catchError((error) => {
            if (error?.error?.msg?.includes(NOT_VALID_COUNTRY_ERROR)) {
              this.routerSrv.navigate('subscription-box/unavailable');
            } else {
              this.subscriptionBoxService.showErrorToast();
              console.error('An error occurred:', error?.error?.msg);
            }

            return of();
          })
        )
      ),
      tap((plan) => {
        this.plan = plan;
        if (!this.router.url.includes('redirect_status=succeeded')) {
          this.setInnerLoader(false, false);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
