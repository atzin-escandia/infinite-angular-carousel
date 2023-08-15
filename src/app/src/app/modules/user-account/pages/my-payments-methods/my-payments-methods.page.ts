import { Component, OnInit, Injector, OnDestroy, AfterViewInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { filter, first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import {
  UserService,
  StripeService,
  EventService,
  CountryService,
  PaymentMethodsService,
  TrackingConstants,
  TrackingService,
} from '@app/services';
import { PopupService } from '@services/popup';
import { BasePage } from '@app/pages';
import { ConfirmationPopupComponent } from '@popups/confirmation-popup';
import { StatusPopupComponent } from '@popups/status-popup';
import { StateService } from '@services/state/state.service';
import {
  IUserPaymentMethodBase,
  IUserPaymentMethodCard,
  IUserPaymentMethodIdeal,
  IUserPaymentMethodPaypal,
  IUserPaymentMethodSepa
} from '@app/interfaces';
import {PurchaseCoreService} from '@app/modules/purchase/services';

@Component({
  selector: 'my-payments-methods',
  templateUrl: './my-payments-methods.page.html',
  styleUrls: ['./my-payments-methods.page.scss']
})
export class MyPaymentsMethodsPageComponent extends BasePage implements OnInit, AfterViewInit, OnDestroy {
  public userSub: Subscription;
  public paymentsMethod: any[] = [];
  public methodAdded: string;
  public updateMethod: boolean = null;
  public idealAllowed = false;
  public paypalAllowed = false;
  public addPayment = false;
  public stripeLoadedSub: Subscription;
  public stripeLoaded = this.stripeSrv.isLoaded();
  public country: string;
  public credits = 0;
  private currentCountrySub: Subscription;
  private pageLoaded = false;

  constructor(
    private userSrv: UserService,
    private purchaseCoreSrv: PurchaseCoreService,
    public injector: Injector,
    public popupSrv: PopupService,
    private stripeSrv: StripeService,
    public eventSrv: EventService,
    public countrySrv: CountryService,
    public paymentMethodsSrv: PaymentMethodsService,
    public stateSrv: StateService,
    public translocoSrv: TranslocoService,
    private trackingSrv: TrackingService,
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    // Stripe init && check if loaded
    this.stripeSrv.init();
    this.stripeLoadedSub = this.stripeSrv.getStripeReady().subscribe(ready => (this.stripeLoaded = ready));
    this.route.queryParams.subscribe(async params => {
      const { profile_id, set_fav, redirect_status, setup_intent, setup_intent_client_secret, payment_type} = params;

      if (redirect_status === 'succeeded') {
        if (profile_id && set_fav && setup_intent && setup_intent_client_secret) {
          this.setLoading(true);
          this.setInnerLoader(true, true);
          let confirmation;

          if (payment_type && payment_type === 'paypal') {
            confirmation = await this.userService.confirmPayPalAuth(profile_id, set_fav, redirect_status,
              setup_intent, setup_intent_client_secret);
          } else {
            confirmation = await this.userService.confirmIdealAuth(profile_id, set_fav, redirect_status,
              setup_intent, setup_intent_client_secret);
          }

          if (confirmation?.result === 'ok') {
            await this.router.navigateByUrl(window.location.pathname, {replaceUrl: true});

            // Load user data and countries on base page
            await this.loadUser(true);
            // Format payment methods
            this.formatPayment();
            // Subscribe to user changes
            this.userSub = this.userSrv.getCurrent().subscribe(() => this.formatPayment());
            // Let private zone menu know that this component is open
            this.eventSrv.dispatchEvent('private-zone-url', {router: this.routerSrv.getPath()});
          }

          this.setLoading(false);
          this.setInnerLoader(false, false);
        }
      }
    });

    this.country = this.countrySrv?.getCountry();

    // Load user data and countries on base page
    await this.loadUser(true);
    // Format payment methods
    this.formatPayment();
    // Subscribe to user changes
    this.userSub = this.userSrv.getCurrent().subscribe(() => this.formatPayment());
    // Let private zone menu know that this component is open
    this.eventSrv.dispatchEvent('private-zone-url', {router: this.routerSrv.getPath()});

    const isCreditsAvailable = await this._checkCreditsAvailability();

    if (isCreditsAvailable) {
      await this._getCredits();
      this._countryChangesSubscribe();
    }

    this.setLoading(false);
    this.setInnerLoader(false, false);

    // check if ideal payment is allowed
    this.idealAllowed = await this.paymentMethodsSrv.checkCountryPaymentMethodAvailability('Ideal', this.country);
    this.paypalAllowed = await this.paymentMethodsSrv.checkCountryPaymentMethodAvailability('PayPal', this.country);

    this.pageLoaded = true;
  }

  ngOnDestroy(): void {
    this.userSub && this.userSub.unsubscribe();
    this.stripeLoadedSub && this.stripeLoadedSub.unsubscribe();
    this.currentCountrySub && this.currentCountrySub.unsubscribe();
  }

  public onCheckboxChange(e: string): void{
    this.methodAdded = e;
  }

  public savingPaymentMethod(): void {
    this.updateMethod =  !this.updateMethod;
  }

  /**
   * format payments
   */
  public formatPayment(): void {
    if (
      this.user &&
      this.user.paymentMethods &&
      this.user.paymentMethods[0] &&
      (this.user.paymentMethods[0].cards || this.user.paymentMethods[0].sepas ||
        this.user.paymentMethods[0].paypals || this.user.paymentMethods[0].ideals)
    ) {
      this.paymentsMethod = [
        ...(this.user.paymentMethods[0].cards ? this.user.paymentMethods[0].cards : []),
        ...(this.user.paymentMethods[0].sepas ? this.user.paymentMethods[0].sepas : []),
        ...(this.user.paymentMethods[0].paypals ? this.user.paymentMethods[0].paypals : []),
        ...(this.user.paymentMethods[0].ideals ? this.user.paymentMethods[0].ideals : [])
      ];
    }

    this.paymentsMethod.sort((a, b) => b.favourite - a.favourite);
  }

  public async paymentAdded(__e: any, type: string): Promise<void> {
    await this.loadUser(true);
    this.formatPayment();
    this.popupSrv.open(StatusPopupComponent, {
      data: {
        msgSuccess: 'successfuly added ' + type
      }
    });
    this.addingStatus(false);
    this.setInnerLoader(false, false);
    this.updateMethod = null;
  }

  public addingStatus(value: boolean): void {
    this.addPayment = value;
  }

  public async setAsDefault(method: any): Promise<void> {
    const id = this.getIdFromMethod(method);

    await this.userSrv.setDefaultPaymentMethod(id);
    await this.userSrv.get(true);

    this.paymentsMethod.sort((a, b) => b.favourite - a.favourite);

    this.popupSrv.open(StatusPopupComponent, {
      data: {
        msgSuccess: 'Default payment method changed'
      }
    });
  }

  public getIdFromMethod(method: any): string {
    let id;

    if (method.cardInfo) {
      id = method.cardInfo.id;
    } else if (method.sepaInfo) {
      id = method.sepaInfo.id;
    } else if (method.paypalInfo) {
      id = method.paypalInfo.id;
    } else {
      id = method.sepaInfo.id;
    }

    return id;
  }

  /**
   * Remove payment method
   */

  public remove(data: IUserPaymentMethodBase & { [key: string]: any }): void {
    const { type, translocoMsgKey, sourceId } = this._getDataToRemovePaymentMethod(data);

    const popup = this.popupSrv.open(ConfirmationPopupComponent, {
      data: {
        title: this.translocoSrv.translate('page.delete-payment.button'),
        msg: this.translocoSrv.translate(`page.sure-delete-${translocoMsgKey}.body`),
      }
    });

    popup.onClose.subscribe(async result => {
      if (result) {
        const params = {type, sourceId};

        let err;

        try {
          await this.userSrv.removePaymentMethod(params);
          await this.userSrv.get(true);
        } catch (error) {
          err = error;
        }

        this.popupSrv.open(StatusPopupComponent, {
          data: {
            err,
            msgSuccess: type + ' successfuly deleted'
          }
        });
      }
    });
  }

  public autoLoginValidation(params: any): void {
    void this.checkLogin(() => this[params.funcName](params.data));
  }

  private async _checkCreditsAvailability(): Promise<boolean> {
    const isCreditsAvailable = await this.stateSrv.isCreditsAvailable()
      .pipe(first((res) => typeof res === 'boolean'))
      .toPromise();

    return isCreditsAvailable;
  }

  private async _getCredits(): Promise<void> {
    try {
      const currentCountry = this.countrySrv.getCurrentCountry();
      const { credits } = await this.userSrv.getCredits(currentCountry?.currency);

      this.credits = credits;
    } catch (err) {
      this.purchaseCoreSrv.common.logError(err);
    }
  }

  private _countryChangesSubscribe(): void {
    this.currentCountrySub = this.stateSrv.$currentCountry.pipe(
      filter((iso) => !!iso && this.pageLoaded)
    ).subscribe(() => {
      void this._getCredits();
    });
  }

  private _getDataToRemovePaymentMethod(
    data: IUserPaymentMethodBase & { [key: string]: any }
  ): { type: string; translocoMsgKey: string; sourceId: string } {
    if ((data as IUserPaymentMethodCard).cardInfo) {
      return { type: 'card', translocoMsgKey: 'card', sourceId: data.cardInfo.id };
    } else  if ((data as IUserPaymentMethodSepa).sepaInfo) {
      return { type: 'sepa', translocoMsgKey: 'bank', sourceId: data.sepaInfo.id };
    } else if ((data as IUserPaymentMethodPaypal).paypalInfo) {
      return { type: 'paypal', translocoMsgKey: 'paypal', sourceId: data.paypalInfo.id };
    } else if ((data as IUserPaymentMethodIdeal).idealInfo) {
      return { type: 'ideal', translocoMsgKey: 'ideal', sourceId: data.idealInfo.id };
    }
  }

  ngAfterViewInit(): void {
    const customEventData = {
      cf_page_title: TrackingConstants.GTM4.CF_PAGE_TITLE.ACCOUNT_MY_PAYMENT_METHODS,
      page_type: TrackingConstants.GTM4.PAGE_TYPE.MY_ACCOUNT,
      language: this.langSrv.getCurrentLang(),
      country_delivery: this.countrySrv.getCurrentCountry()?.iso
    };

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PAGE_VIEW, false, customEventData);
  }
}
