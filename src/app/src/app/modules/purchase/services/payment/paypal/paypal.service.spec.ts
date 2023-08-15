import { TestBed } from '@angular/core/testing';
import { CheckoutPaymentPaypalService } from './paypal.service';
import { CheckoutPaymentCommonService, CheckoutStoreService } from '@modules/purchase/services';

import * as helpers from '../../../../../../test/helper';

describe('CheckoutPaymentPaypalService', () => {
  let service: CheckoutPaymentPaypalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...helpers.providers, CheckoutPaymentPaypalService, CheckoutStoreService, CheckoutPaymentCommonService],
      imports: helpers.imports,
    });
    service = TestBed.inject(CheckoutPaymentPaypalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
