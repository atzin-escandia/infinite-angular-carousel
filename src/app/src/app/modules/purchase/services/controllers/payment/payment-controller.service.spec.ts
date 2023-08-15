import { TestBed } from '@angular/core/testing';
import { CheckoutPaymentControllerService } from './payment-controller.service';

describe('CheckoutPaymentControllerService', () => {
  let service: CheckoutPaymentControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutPaymentControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
