import { TestBed } from '@angular/core/testing';
import { CheckoutStripeCallbacksService } from './stripe-callbacks.service';

describe('CheckoutStripeCallbacksService', () => {
  let service: CheckoutStripeCallbacksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutStripeCallbacksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
