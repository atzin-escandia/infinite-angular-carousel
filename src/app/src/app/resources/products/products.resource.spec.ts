import {TestBed} from '@angular/core/testing';

import {ProductsResource} from './products.resource';

import * as helpers from '../../../test/helper';

describe('UpResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: ProductsResource = TestBed.inject(ProductsResource);
    expect(service).toBeTruthy();
  });
});
