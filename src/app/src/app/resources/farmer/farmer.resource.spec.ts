import {TestBed} from '@angular/core/testing';

import {FarmerResource} from './farmer.resource';

import * as helpers from '../../../test/helper';

describe('FarmerResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: FarmerResource = TestBed.inject(FarmerResource);
    expect(service).toBeTruthy();
  });
});
