import {TestBed} from '@angular/core/testing';

import {SeasonsResource} from './seasons.resource';

import * as helpers from '../../../test/helper';

describe('SeasonsResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [helpers.providers],
      imports: [helpers.imports]
    });
  });

  it('should be created', () => {
    const service: SeasonsResource = TestBed.inject(SeasonsResource);
    expect(service).toBeTruthy();
  });
});
