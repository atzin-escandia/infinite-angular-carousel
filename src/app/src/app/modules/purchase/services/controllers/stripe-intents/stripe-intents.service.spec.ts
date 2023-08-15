import { TestBed } from '@angular/core/testing';
import { CheckoutStripeIntentsControllerService } from './stripe-intents.service';

describe('CheckoutStripeIntentsControllerService', () => {
  let service: CheckoutStripeIntentsControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutStripeIntentsControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
