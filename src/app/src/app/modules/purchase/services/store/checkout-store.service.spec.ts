import { TestBed } from '@angular/core/testing';
import { CheckoutStoreService } from './checkout-store.service';

describe('CheckoutStoreService', () => {
  let service: CheckoutStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
