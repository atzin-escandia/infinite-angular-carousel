import { TestBed } from '@angular/core/testing';
import { CheckoutPaymentCommonService } from './common.service';
import * as helpers from '../../../../../../test/helper';

describe('CheckoutPaymentCommonService', () => {
  let service: CheckoutPaymentCommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...helpers.providers, ...helpers.checkoutProviders],
      imports: helpers.imports,
    });
    service = TestBed.inject(CheckoutPaymentCommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
