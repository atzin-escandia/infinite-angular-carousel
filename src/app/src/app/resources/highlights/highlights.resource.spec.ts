import {TestBed} from '@angular/core/testing';

import {HighlightsResource} from './highlights.resource';

import * as helpers from '../../../test/helper';

describe('OrdersResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: HighlightsResource = TestBed.inject(HighlightsResource);
    expect(service).toBeTruthy();
  });
});
