import {TestBed} from '@angular/core/testing';

import {ApiResource} from './api.resource';

import * as helpers from '../../../test/helper';

describe('ApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [helpers.providers],
      imports: [helpers.imports]
    });
  });

  it('should be created', () => {
    const service: ApiResource = TestBed.inject(ApiResource);
    expect(service).toBeTruthy();
  });
});
