import {TestBed} from '@angular/core/testing';

import {UserResource} from './user.resource';

import * as helpers from '../../../test/helper';

describe('UserResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: UserResource = TestBed.inject(UserResource);
    expect(service).toBeTruthy();
  });
});
