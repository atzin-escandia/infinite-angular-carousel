import { TestBed } from '@angular/core/testing';

import { CheckoutPaymentCardService } from './card.service';
import * as helpers from '../../../../../../test/helper';

describe('CheckoutPaymentCardService', () => {
  let service: CheckoutPaymentCardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...helpers.providers, ...helpers.checkoutProviders],
      imports: helpers.imports,
    });
    service = TestBed.inject(CheckoutPaymentCardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
