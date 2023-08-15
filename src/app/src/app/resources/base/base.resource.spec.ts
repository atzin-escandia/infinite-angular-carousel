import {TestBed} from '@angular/core/testing';

import {BaseResource} from './base.resource';

import * as helpers from '../../../test/helper';

describe('BaseResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: BaseResource = TestBed.inject(BaseResource);
    expect(service).toBeTruthy();
  });
});
