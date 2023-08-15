import {TestBed} from '@angular/core/testing';

import {PricesResource} from './prices.resource';

import * as helpers from '../../../test/helper';

describe('PricesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be PricesResource', () => {
    const service: PricesResource = TestBed.inject(PricesResource);
    expect(service).toBeTruthy();
  });
});
