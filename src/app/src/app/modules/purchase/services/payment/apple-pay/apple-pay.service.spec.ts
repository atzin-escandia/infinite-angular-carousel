import { TestBed } from '@angular/core/testing';
import { CheckoutPaymentApplePayService } from './apple-pay.service';

describe('CheckoutPaymentApplePayService', () => {
  let service: CheckoutPaymentApplePayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutPaymentApplePayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
