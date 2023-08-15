import {TestBed} from '@angular/core/testing';

import {USStatesResource} from './us-states.resource';

import * as helpers from '../../../test/helper';

describe('countrySrv', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: USStatesResource = TestBed.inject(USStatesResource);
    expect(service).toBeTruthy();
  });
});
