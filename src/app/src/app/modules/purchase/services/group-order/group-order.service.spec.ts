import { TestBed } from '@angular/core/testing';
import { CheckoutGroupOrderService } from './group-order.service';

describe('CheckoutGroupOrderService', () => {
  let service: CheckoutGroupOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutGroupOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
