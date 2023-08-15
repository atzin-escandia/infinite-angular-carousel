import { TestBed } from '@angular/core/testing';
import { CheckoutHandlersService } from './handlers.service';

describe('CheckoutHandlersService', () => {
  let service: CheckoutHandlersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutHandlersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
