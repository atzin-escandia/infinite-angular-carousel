/// <reference types="stripe-v3" />
/* eslint-disable @typescript-eslint/unbound-method */
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { PurchaseCoreService } from '../../../../services/purchase.service';
import { StatusPopupComponent } from '@popups/status-popup';
import { StripeService, TextService, TrackingConstants, UserService } from '@app/services';
import { PopupService } from '@services/popup';
import { STRIPE_CARD_INPUT_STYLES } from '../payments.conf';
import { PurchaseError } from '@app/modules/purchase/models/error.model';

@Component({
  selector: 'sepa-payment',
  templateUrl: './sepa-payment.component.html',
  styleUrls: ['./sepa-payment.component.scss'],
})
export class SepaPaymentComponent implements OnInit {
  @Input() stripeRef: any;

  @Output() afterSepaAdded = new EventEmitter<{ id: string; setAsFavorite: boolean }>();

  @ViewChild('sepaElement', { static: true }) sepaElement: ElementRef;

  public nameFC = this.buildNameFC();
  public sepa: any;
  public stripeSecret: any;
  public sepaError: string | null;
  public isSepaDataComplete = false;
  public showStripe = false;
  public isFavourite = false;

  constructor(
    private purchaseCoreSrv: PurchaseCoreService,
    public textSrv: TextService,
    private stripeSrv: StripeService,
    private userSrv: UserService,
    private popupSrv: PopupService
  ) {}

  ngOnInit(): void {
    void this.initStripe();
  }

  onAdd(): void {
    if (this.nameFC.valid && this.isSepaDataComplete && !this.sepaError) {
      this.purchaseCoreSrv.common.setInnerLoader(true, true);
      void this.createToken();
    }
  }

  async createToken(): Promise<void | boolean> {
    try {
      const params = {
        type: 'sepa_debit',
        currency: 'eur',
        owner: {
          name: this.nameFC.value,
        },
      };

      const tokenResult: stripe.SourceResponse = await this.stripeSrv.get().createSource(this.sepa, params);

      if (tokenResult.error) {
        this.purchaseCoreSrv.common.setInnerLoader(false, false);

        this.popupSrv.open(StatusPopupComponent, {
          data: {
            err: true,
            msgError: this.textSrv.getText('Operation not available'),
          },
        });

        throw new PurchaseError({
          name: 'SEPA_ERROR',
          message: 'SEPA create token error',
          cause: tokenResult.error,
        });
      } else {
        await this.tryToAddSepa(tokenResult);
      }
    } catch (err) {
      this.purchaseCoreSrv.common.logError(err);
      this.purchaseCoreSrv.checkoutAnalyticsSrv.trackGA4Analytics(TrackingConstants.GTM4.CHECKOUT_KO_CODE);
    }
  }

  private async initStripe(): Promise<void> {
    const stripe = await this.stripeSrv.get();
    const stripeElems = stripe.elements();

    this.sepa = stripeElems.create('iban', {
      style: STRIPE_CARD_INPUT_STYLES,
      supportedCountries: ['SEPA'],
      hidePostalCode: true,
    });

    this.sepa.mount(this.sepaElement.nativeElement);
    this.purchaseCoreSrv.store.setStripeRef({ ...this.stripeRef, sepa: this.sepa });

    this.sepa.addEventListener('ready', () => {
      this.showStripe = true;
      this.listenSepaDataChanges();
    });
  }

  private listenSepaDataChanges(): void {
    this.sepa.addEventListener('change', (res: stripe.elements.ElementChangeResponse) => {
      this.isSepaDataComplete = res.complete;
      this.sepaError = res.error ? res.error && res.error.message : null;
    });
  }

  private async tryToAddSepa(tokenResult: any): Promise<void> {
    try {
      await this.userSrv.addSEPA(tokenResult);
      this.isFavourite && (await this.userSrv.setDefaultPaymentMethod(tokenResult.source.id));
      this.afterSepaAdded.emit({ id: tokenResult.source.id, setAsFavorite: this.isFavourite });
    } catch (err) {
      if (err.msg) {
        this.sepaError = this.textSrv.getText(err.msg);
      }

      throw new PurchaseError({
        name: 'SEPA_ERROR',
        message: err?.msg || 'SEPA add error',
        cause: err,
      });
    } finally {
      this.purchaseCoreSrv.common.setInnerLoader(false, false);
    }
  }

  private buildNameFC(): UntypedFormControl {
    return new UntypedFormControl('', Validators.compose([Validators.required, Validators.minLength(3)]));
  }
}
