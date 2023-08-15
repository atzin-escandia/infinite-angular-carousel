/// <reference types="stripe-v3" />
/* eslint-disable @typescript-eslint/unbound-method */
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { PurchaseCoreService } from '../../../../services/purchase.service';
import { StripeService, TextService } from '@app/services';
import { STRIPE_CARD_SELECT_STYLES } from '../payments.conf';

@Component({
  selector: 'ideal-payment',
  templateUrl: './ideal-payment.component.html',
  styleUrls: ['./ideal-payment.component.scss'],
})
export class IdealPaymentComponent implements OnInit {
  @Input() stripeRef: any;

  @ViewChild('idealElement', { static: true }) idealElement: ElementRef;

  public nameFC = this.buildNameFC();
  public isFavourite = false;
  public stripeSecret: any;
  public ideal: any;
  public showStripe = false;
  public idealValue: string;
  public idealError: string | null;

  constructor(private purchaseCoreSrv: PurchaseCoreService, public textSrv: TextService, private stripeSrv: StripeService) {}

  ngOnInit(): void {
    void this.initStripe();
  }

  private async initStripe(): Promise<void> {
    const stripe = await this.stripeSrv.get();
    const stripeElems = stripe.elements();

    this.stripeSecret = await this.stripeSrv.getSecret('ideal');
    this.ideal = stripeElems.create('idealBank', { style: STRIPE_CARD_SELECT_STYLES, hidePostalCode: true });
    this.ideal.mount(this.idealElement.nativeElement);

    this.purchaseCoreSrv.store.setStripeRef({
      ...this.stripeRef,
      name: '',
      ideal: this.ideal,
      stripeSecret: this.stripeSecret.client_secret,
    });

    this.ideal.addEventListener('ready', () => {
      this.showStripe = true;
      this.listenIdealDataChanges();
    });
  }

  private listenIdealDataChanges(): void {
    this.ideal.addEventListener('change', (res: stripe.elements.ElementChangeResponse) => {
      this.idealValue = res.value as string;
      this.idealError = res.error ? res.error && res.error.message : null;
    });
  }

  onAdd(): void {
    if (this.nameFC.valid && this.idealValue && !this.idealError) {
      this.purchaseCoreSrv.common.setInnerLoader(true, true);
      void this.createToken();
    }
  }

  private async createToken(): Promise<void> {
    const path = window.location.href;
    const userId = this.purchaseCoreSrv.store.user._id;
    const stripe = await this.stripeSrv.get();

    this.purchaseCoreSrv.core.saveOrderDataBeforeRedirect();

    await stripe.confirmIdealSetup(this.stripeSecret.client_secret, {
      payment_method: {
        ideal: this.ideal,
        billing_details: {
          name: this.nameFC.value,
          email: this.purchaseCoreSrv.store.user.email,
        },
      },
      return_url: `${path}&profile_id=${userId}&set_fav=${this.isFavourite ? 'true' : 'false'}`,
    });
  }

  private buildNameFC(): UntypedFormControl {
    return new UntypedFormControl('', Validators.compose([Validators.required, Validators.minLength(3)]));
  }
}
