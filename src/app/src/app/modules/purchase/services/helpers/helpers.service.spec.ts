import { TestBed } from '@angular/core/testing';

import { CheckoutHelpersService } from './helpers.service';

describe('CheckoutHelpersService', () => {
  let service: CheckoutHelpersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutHelpersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
