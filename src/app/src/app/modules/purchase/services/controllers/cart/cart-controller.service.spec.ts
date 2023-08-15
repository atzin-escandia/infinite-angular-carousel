import { TestBed } from '@angular/core/testing';
import { CheckoutCartControllerService } from './cart-controller.service';

describe('CheckoutCartControllerService', () => {
  let service: CheckoutCartControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutCartControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
