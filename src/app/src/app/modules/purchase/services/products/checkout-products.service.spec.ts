import { TestBed } from '@angular/core/testing';

import { CheckoutProductsService } from './checkout-products.service';

describe('CheckoutProductsService', () => {
  let service: CheckoutProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
