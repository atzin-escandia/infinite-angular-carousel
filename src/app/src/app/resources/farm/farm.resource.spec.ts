import {TestBed} from '@angular/core/testing';

import {FarmResource} from './farm.resource';

import * as helpers from '../../../test/helper';

describe('FarmResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: FarmResource = TestBed.inject(FarmResource);
    expect(service).toBeTruthy();
  });
});
