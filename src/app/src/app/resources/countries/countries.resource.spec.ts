import {TestBed} from '@angular/core/testing';

import {CountriesResource} from './countries.resource';

import * as helpers from '../../../test/helper';

describe('countrySrv', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: CountriesResource = TestBed.inject(CountriesResource);
    expect(service).toBeTruthy();
  });
});
