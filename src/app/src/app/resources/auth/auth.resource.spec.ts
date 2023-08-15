import {TestBed} from '@angular/core/testing';

import {AuthResource} from './auth.resource';

import * as helpers from '../../../test/helper';

describe('AuthResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: AuthResource = TestBed.inject(AuthResource);
    expect(service).toBeTruthy();
  });
});
