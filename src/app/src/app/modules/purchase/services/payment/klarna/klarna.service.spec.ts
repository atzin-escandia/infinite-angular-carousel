import { TestBed } from '@angular/core/testing';
import { CheckoutPaymentKlarnaService } from './klarna.service';

describe('CheckoutPaymentKlarnaService', () => {
  let service: CheckoutPaymentKlarnaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutPaymentKlarnaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
