/// <reference types="stripe-v3" />
/* eslint-disable @typescript-eslint/unbound-method */
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { INewCardData } from '../../../../../../interfaces';
import { StripeService, TextService } from '../../../../../../services';
import { STRIPE_CARD_INPUT_STYLES } from '../payments.conf';

@Component({
  selector: 'card-payment',
  templateUrl: './card-payment.component.html',
  styleUrls: ['./card-payment.component.scss'],
})
export class CardPaymentComponent implements OnInit {
  @Input() stripeRef: any;

  @Output() pay = new EventEmitter<INewCardData>();

  @ViewChild('cardElement', { static: true }) cardElement: ElementRef;

  public nameFC = this.buildNameFC();
  public card: stripe.elements.Element;
  public cardError: string | null;
  public isCardDataComplete = false;
  public showStripe = false;

  constructor(public textSrv: TextService, private stripeSrv: StripeService) {}

  ngOnInit(): void {
    void this.initStripe();
  }

  private async initStripe(): Promise<void> {
    const stripe = await this.stripeSrv.get();
    const stripeElems = stripe.elements();

    this.card = stripeElems.create('card', { style: STRIPE_CARD_INPUT_STYLES, hidePostalCode: true });
    this.card.mount(this.cardElement.nativeElement);
    this.card.addEventListener('ready', () => {
      this.showStripe = true;
      this.listenCardDataChanges();
    });
  }

  private listenCardDataChanges(): void {
    this.card.addEventListener('change', (res: stripe.elements.ElementChangeResponse) => {
      this.isCardDataComplete = res.complete;
      this.cardError = res.error ? res.error && res.error.message : null;
    });
  }

  public onAdd(): void {
    if (this.nameFC.valid && this.isCardDataComplete && !this.cardError) {
      this.pay.emit({ name: this.nameFC.value, card: this.card });
    }
  }

  private buildNameFC(): UntypedFormControl {
    return new UntypedFormControl('', Validators.compose([Validators.required, Validators.minLength(3)]));
  }
}
