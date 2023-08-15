import {TestBed} from '@angular/core/testing';

import {PaymentMethodsResource} from './payment-methods.resource';

import * as helpers from '../../../test/helper';

describe('PaymentMethodsResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: PaymentMethodsResource = TestBed.inject(PaymentMethodsResource);
    expect(service).toBeTruthy();
  });
});
