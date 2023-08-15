import {TestBed} from '@angular/core/testing';

import {IpapiResource} from './ipapi.resource';

import * as helpers from '../../../test/helper';

describe('IpapiResource', () => {
  TestBed.configureTestingModule({
    providers: [helpers.providers],
    imports: [helpers.imports]
  });

  it('should be created', () => {
    const service: IpapiResource = TestBed.inject(IpapiResource);
    expect(service).toBeTruthy();
  });
});
