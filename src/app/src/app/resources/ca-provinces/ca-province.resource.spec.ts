import {TestBed} from '@angular/core/testing';

import {CaProvincesResource} from './ca-province.resource';

import * as helpers from '../../../test/helper';

describe('countrySrv', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: CaProvincesResource = TestBed.inject(CaProvincesResource);
    expect(service).toBeTruthy();
  });
});
