import {TestBed} from '@angular/core/testing';

import {OrdersResource} from './orders.resource';

import * as helpers from '../../../test/helper';

describe('OrdersResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: OrdersResource = TestBed.inject(OrdersResource);
    expect(service).toBeTruthy();
  });
});
