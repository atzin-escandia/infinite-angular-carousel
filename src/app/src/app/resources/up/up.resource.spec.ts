import {TestBed} from '@angular/core/testing';

import {UpResource} from './up.resource';

import * as helpers from '../../../test/helper';

describe('UpResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: UpResource = TestBed.inject(UpResource);
    expect(service).toBeTruthy();
  });
});
