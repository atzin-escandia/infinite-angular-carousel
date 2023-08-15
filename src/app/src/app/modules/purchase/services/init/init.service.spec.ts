import { TestBed } from '@angular/core/testing';
import { CheckoutInitService } from './init.service';

describe('CheckoutInitService', () => {
  let service: CheckoutInitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutInitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
