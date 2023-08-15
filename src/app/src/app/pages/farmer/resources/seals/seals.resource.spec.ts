import {TestBed} from '@angular/core/testing';

import {SealsResource} from './seals.resource';

import * as helpers from '../../../../../test/helper';

describe('SealsResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [helpers.providers],
      imports: [helpers.imports]
    });
  });

  it('should be created', () => {
    const service: SealsResource = TestBed.inject(SealsResource);
    expect(service).toBeTruthy();
  });
});
