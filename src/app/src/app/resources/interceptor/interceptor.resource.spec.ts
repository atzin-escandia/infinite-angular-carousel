import {TestBed} from '@angular/core/testing';

import {InterceptorResource} from './interceptor.resource';

import * as helpers from '../../../test/helper';

describe('InterceptorResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [helpers.providers],
      imports: [helpers.imports]
    });
  });

  it('should be created', () => {
    const service: InterceptorResource = TestBed.inject(InterceptorResource);
    expect(service).toBeTruthy();
  });
});
