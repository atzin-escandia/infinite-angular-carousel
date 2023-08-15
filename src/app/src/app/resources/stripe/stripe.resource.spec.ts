import {TestBed} from '@angular/core/testing';

import {StripeResource} from './stripe.resource';

import * as helpers from '../../../test/helper';

describe('StripeResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: StripeResource = TestBed.inject(StripeResource);
    expect(service).toBeTruthy();
  });
});
