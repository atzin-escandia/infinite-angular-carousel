import { TestBed } from '@angular/core/testing';
import { PaymentMethodsResource } from './payment-methods.service';

describe('PaymentMethodsResource', () => {
  let service: PaymentMethodsResource;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentMethodsResource);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
