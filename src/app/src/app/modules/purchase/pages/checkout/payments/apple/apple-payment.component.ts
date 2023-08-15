import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { PurchaseCoreService } from '../../../../services';
import { CurrencyType } from '@constants/app.constants';
import { LoggerService, RouterService, StripeService, TrackingConstants } from '@app/services';
import { IAddress } from '@app/interfaces';
import { PAYMENT_METHOD } from '../../../../constants/payment-method.constants';
import { IApplePayPaymentMethod } from '../../../../interfaces/order.interface';
import { IPhone } from '@app/interfaces/phone.interface';
import { PhoneNumberUtil, PhoneNumber } from 'google-libphonenumber';
import { PurchaseError } from '@app/modules/purchase/models/error.model';
import { PRODUCT_TYPE } from '@app/constants/product.constants';

@Component({
  selector: 'app-apple-payment',
  templateUrl: './apple-payment.component.html',
  styleUrls: ['./apple-payment.component.scss'],
})
export class ApplePaymentComponent implements OnInit {
  @Input() iso: string;
  @Input() currency: CurrencyType;
  @Input() isUserLogged: boolean;
  @Input() price: number;
  @Input() canBuyWithoutGiftRestrictions: boolean;
  @Input() set isDisabled(isDisabled: boolean) {
    this._isDisabled = isDisabled;
    void this.initApplePay();
  }

  get isDisabled(): boolean {
    return this._isDisabled;
  }

  @Output() giftFormEmpty = new EventEmitter<boolean>();

  @HostBinding('attr.id') attrId = 'applePayBtn';

  private _isDisabled: boolean;
  private isStartingApplePay = false;
  private phoneNumberUtil;
  private config: { totalLabel: string; shippingOptions: stripe.paymentRequest.ShippingOption[] } = {
    totalLabel: 'CrowdFarming',
    shippingOptions: [
      {
        id: 'Standard-shipping',
        label: 'Standard shipping',
        amount: 0,
      },
    ],
  };

  paymentRequest: stripe.paymentRequest.StripePaymentRequest;

  constructor(
    private stripeSrv: StripeService,
    private purchaseCoreSrv: PurchaseCoreService,
    private routerSrv: RouterService,
    private loggerSrv: LoggerService
  ) {}

  ngOnInit(): void {
    void this.initApplePay();
  }

  onMockButtonClick(): void {
    if (!this.isDisabled) {
      if (!this.isUserLogged) {
        this.routerSrv.navigate('login-register', null, { rc: true, rcr: true });
      } else if (!this.canBuyWithoutGiftRestrictions) {
        this.giftFormEmpty.emit(this.canBuyWithoutGiftRestrictions);
      }
    }
  }

  private async initApplePay(): Promise<void> {
    if (this.isUserLogged && !this.isDisabled && !this.isStartingApplePay) {
      this.isStartingApplePay = true;

      try {
        const stripe: stripe.Stripe = await this.stripeSrv.get();
        const elements = stripe.elements();
        const paymentRequestOptions = this.getPaymentRequestOptions();

        this.phoneNumberUtil = PhoneNumberUtil.getInstance();
        this.paymentRequest = stripe.paymentRequest(paymentRequestOptions);

        const prButton = elements.create('paymentRequestButton', {
          paymentRequest: this.paymentRequest,
          style: { paymentRequestButton: { theme: 'dark', height: '48px' } },
        });

        const canMakePayment = await this.paymentRequest.canMakePayment();

        if (canMakePayment?.applePay) {
          prButton.mount('#payment-request-button');
          this.handleShippingAddressChange();
          this.handlePayment(stripe);
        } else {
          document.getElementById('payment-request-button').style.display = 'none';
        }

        this.isStartingApplePay = false;
      } catch (err) {
        this.isStartingApplePay = false;

        this.purchaseCoreSrv.common.logError(
          new PurchaseError({
            name: 'APPLE_PAY_ERROR',
            message: 'Apple Pay init error',
            cause: err,
          })
        );
      }
    }
  }

  private getPaymentRequestOptions(): stripe.paymentRequest.StripePaymentRequestOptions {
    return {
      country: this.iso.toUpperCase(),
      currency: this.currency.toLowerCase(),
      total: { label: this.config.totalLabel, amount: this.getAmmout() },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
      requestShipping: true,
      shippingOptions: this.config.shippingOptions,
    };
  }

  private handleShippingAddressChange(): void {
    this.paymentRequest.on('shippingaddresschange', async (ev) => {
      if (!this.isDisabled) {
        const shippingAddressCountry = ev.shippingAddress.country.toLowerCase();
        const hasEcProduct = this.purchaseCoreSrv.store.products.find((elem) => elem.type === PRODUCT_TYPE.ECOMMERCE);

        if (hasEcProduct && shippingAddressCountry !== 'de') {
          ev.updateWith({
            status: 'invalid_shipping_address',
          });
        } else {
          try {
            let options: stripe.paymentRequest.UpdateDetails;

            if (shippingAddressCountry !== this.iso) {
              const { price } = await this.purchaseCoreSrv.handlers.changeToApplePayWalletAddress(shippingAddressCountry);

              options = this.getUpdateDetails(price);
            } else {
              options = this.getUpdateDetails();
            }

            ev.updateWith(options);
          } catch (err) {
            this.purchaseCoreSrv.common.logError(
              new PurchaseError({
                name: 'APPLE_PAY_ERROR',
                message: 'Apple Pay address change error',
                cause: err,
              })
            );
            this.purchaseCoreSrv.checkoutAnalyticsSrv.trackGA4Analytics(TrackingConstants.GTM4.CHECKOUT_KO_CODE);

            ev.updateWith({
              status: 'invalid_shipping_address',
            });
          }
        }
      } else {
        ev.updateWith({
          status: 'fail',
        });
      }
    });
  }

  private handlePayment(stripe: stripe.Stripe): void {
    this.paymentRequest.on('paymentmethod', async (ev: stripe.paymentRequest.StripePaymentMethodPaymentResponse) => {
      if (!this.isDisabled) {
        const { payerName, paymentMethod, shippingAddress, payerPhone } = ev;

        this.loggerSrv.log(`New apple payment`, { purchaseInfo: ev });

        try {
          const payerPhoneParsed = this.parsePhoneNumber(payerPhone, shippingAddress.country);
          const orderAddress = this.mapAddress(payerName, shippingAddress, payerPhoneParsed);
          const { client_secret } = await this.purchaseCoreSrv.payments.applePay.getStripeIntent(this.currency);
          const { error, paymentIntent } = await stripe.confirmCardPayment(
            client_secret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );

          if (error) {
            throw new PurchaseError({
              name: 'APPLE_PAY_ERROR',
              message: 'Apple Pay payment error',
              cause: error,
            });
          }

          if (paymentIntent.status === this.purchaseCoreSrv.payments.common.stripeIntentStatuses.reqAction) {
            await this.confirmPayment(stripe, client_secret);
          }

          const orderPm = this.mapPaymentMethod(paymentMethod, paymentIntent);

          this.purchaseCoreSrv.store.setLastPaymentIntent(paymentIntent);
          await this.purchaseCoreSrv.payments.applePay.generateOrder(orderPm, orderAddress);
          ev.complete('success');
        } catch (err) {
          this.loggerSrv.error(`Apple pay error`, err);
          const message = ['invalid_shipping_address', 'invalid_payer_phone'].includes(err?.message) ? err.message : 'fail';

          ev.complete(message);
        }
      } else {
        ev.complete('fail');
      }
    });
  }

  private parsePhoneNumber(phone: string, country: string): PhoneNumber {
    const iso = country.toUpperCase();

    let phoneNumber;
    let cleanedPhone = phone.trim().replace(/\s/g, '');

    if (cleanedPhone.startsWith('00')) {
      cleanedPhone = `+${cleanedPhone.substr(2)}`;
    }

    try {
      phoneNumber = this.phoneNumberUtil.parse(cleanedPhone, '');
    } catch (err) {
      this.loggerSrv.warning('Apple pay phone not valid round 0');
    }

    if (!phoneNumber || !this.phoneNumberUtil.isPossibleNumber(phoneNumber)) {
      this.loggerSrv.warning('Apple pay phone not valid round 1');

      try {
        phoneNumber = this.phoneNumberUtil.parse(cleanedPhone, iso);
      } catch (e) {
        this.loggerSrv.warning('Apple pay phone not valid round 2');
      }
    }

    if (!phoneNumber || !this.phoneNumberUtil.isPossibleNumber(phoneNumber)) {
      this.loggerSrv.error(`Apple pay phone not valid finally: ${phone} - ${country}`);
      throw new Error('invalid_payer_phone');
    }

    return phoneNumber;
  }

  private async confirmPayment(stripe: stripe.Stripe, client_secret: string): Promise<void> {
    try {
      const confirmCardPaymentRes = await stripe.confirmCardPayment(client_secret);

      if (confirmCardPaymentRes?.error) {
        throw new PurchaseError({
          name: 'APPLE_PAY_ERROR',
          message: 'Apple Pay confirm payment error',
          cause: confirmCardPaymentRes.error,
        });
      }
    } catch (err) {
      throw new PurchaseError({
        name: 'APPLE_PAY_ERROR',
        message: 'Apple Pay payment error',
        cause: err,
      });
    }
  }

  private getUpdateDetails(newPrice: number = this.price): stripe.paymentRequest.UpdateDetails {
    return {
      status: 'success',
      total: {
        label: this.config.totalLabel,
        amount: this.getAmmout(newPrice),
      },
    };
  }

  private mapPaymentMethod(
    paymentMethod: stripe.paymentMethod.PaymentMethod,
    paymentIntent: stripe.paymentIntents.PaymentIntent
  ): IApplePayPaymentMethod {
    return { card: paymentMethod.card, intent: paymentIntent, type: PAYMENT_METHOD.CARD };
  }

  private mapAddress(payerName: string, walletAddress: stripe.paymentRequest.ShippingAddress, payerPhone: PhoneNumber): IAddress {
    try {
      const { firstName, lastName } = this.getFullName(payerName);
      const addressLine = walletAddress.addressLine[0].split(',').map((elem) => elem.trim());
      const phone = this.handlePhoneNumber(payerPhone);

      return {
        name: firstName,
        surnames: lastName,
        phone,
        street: addressLine[0],
        number: addressLine[1],
        details: '',
        city: walletAddress.city,
        province: walletAddress.region || walletAddress.city,
        zip: walletAddress.postalCode,
        country: walletAddress.country.toLowerCase(),
      };
    } catch (e) {
      throw new Error('invalid_shipping_address');
    }
  }

  private handlePhoneNumber(phone: PhoneNumber): IPhone {
    return {
      prefix: '+' + phone.getCountryCode().toString(),
      number: phone.getNationalNumber().toString(),
    };
  }

  private getFullName(name: string): { firstName: string; lastName: string } {
    const nameSplit = name.split(' ');
    const firstName = nameSplit[0];
    let lastName = '';

    if (nameSplit.length === 2) {
      lastName = nameSplit[1];
    } else if (nameSplit.length > 2) {
      for (let i = 1; i < nameSplit.length; i++) {
        lastName = lastName ? `${lastName} ${nameSplit[i]}` : nameSplit[i];
      }
    }

    return { firstName, lastName };
  }

  private getAmmout(price: number = this.price): number {
    return Math.round(price * 100);
  }
}
