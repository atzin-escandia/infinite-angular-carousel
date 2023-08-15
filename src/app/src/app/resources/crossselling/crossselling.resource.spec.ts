import {TestBed} from '@angular/core/testing';

import {CrossSellingResource} from './crossselling.resource';

import * as helpers from '../../../test/helper';

describe('CartsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: CrossSellingResource = TestBed.inject(CrossSellingResource);
    expect(service).toBeTruthy();
  });
});
