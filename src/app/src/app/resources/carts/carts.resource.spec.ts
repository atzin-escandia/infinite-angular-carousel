import {TestBed} from '@angular/core/testing';

import {CartsResource} from './carts.resource';

import * as helpers from '../../../test/helper';

describe('CartsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: CartsResource = TestBed.inject(CartsResource);
    expect(service).toBeTruthy();
  });
});
