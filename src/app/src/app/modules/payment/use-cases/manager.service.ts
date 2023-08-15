import { Injectable, inject } from '@angular/core';
import { CardPaymentUseCaseService } from './card-payment.service';
import { ConfirmStripeCardIntentUseCaseService } from './confirm-stripe-card-intent.service';
import { CreateStripeIntentUseCaseService } from './create-stripe-intent.service';
import { NewCardPaymentUseCaseService } from './new-card-payment.service';
import { RemovePaymentMethodUseCaseService } from './remove-payment-method.service';
import { PaypalPaymentUseCaseService } from './paypal-payment.service';
import { CreatePaymentMethodUseCaseService } from './create-payment-method.service';

@Injectable()
export class PaymentUseCasesManagerService {
  cardPayment = inject(CardPaymentUseCaseService);
  confirmStripeCardIntent = inject(ConfirmStripeCardIntentUseCaseService);
  createPaymentMethod = inject(CreatePaymentMethodUseCaseService);
  createStripeIntent = inject(CreateStripeIntentUseCaseService);
  newCardPayment = inject(NewCardPaymentUseCaseService);
  payPalPayment = inject(PaypalPaymentUseCaseService);
  removePayment = inject(RemovePaymentMethodUseCaseService);
}
