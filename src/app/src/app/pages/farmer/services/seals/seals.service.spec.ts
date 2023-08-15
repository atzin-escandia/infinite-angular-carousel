import {TestBed} from '@angular/core/testing';

import {SealsService} from './seals.service';

import * as helpers from '../../../../../test/helper';

describe('SealsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: SealsService = TestBed.inject(SealsService);
    expect(service).toBeTruthy();
  });
});
