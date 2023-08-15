import {TestBed} from '@angular/core/testing';

import {SearchResource} from './search.resource';

import * as helpers from '../../../test/helper';

describe('SearchResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [helpers.providers],
      imports: [helpers.imports]
    });
  });

  it('should be created', () => {
    const service: SearchResource = TestBed.inject(SearchResource);
    expect(service).toBeTruthy();
  });
});
