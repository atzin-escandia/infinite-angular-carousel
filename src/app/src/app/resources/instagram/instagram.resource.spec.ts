import {TestBed} from '@angular/core/testing';

import {InstagramResource} from './instagram.resource';

import * as helpers from '../../../test/helper';

describe('InstagramResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: InstagramResource = TestBed.inject(InstagramResource);
    expect(service).toBeTruthy();
  });
});
