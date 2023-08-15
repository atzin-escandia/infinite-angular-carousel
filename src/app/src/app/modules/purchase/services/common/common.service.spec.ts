import { TestBed } from '@angular/core/testing';
import { CheckoutCommonService } from './common.service';

describe('CheckoutCommonService', () => {
  let service: CheckoutCommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutCommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
