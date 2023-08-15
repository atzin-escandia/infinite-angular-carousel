import {TestBed} from '@angular/core/testing';

import {PurchaseResource} from './purchase.resource';

import * as helpers from '../../../test/helper';

describe('PurchaseResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: PurchaseResource = TestBed.inject(PurchaseResource);
    expect(service).toBeTruthy();
  });
});
