import {TestBed} from '@angular/core/testing';

import {HomeResource} from './home.resource';

import * as helpers from '../../../test/helper';

describe('OrdersResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: HomeResource = TestBed.inject(HomeResource);
    expect(service).toBeTruthy();
  });
});
