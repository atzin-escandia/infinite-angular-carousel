import {TestBed, inject} from '@angular/core/testing';

import {AutologinGuard} from './autologin.guard';

import * as helpers from '../../../test/helper';

describe('AutologinGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AutologinGuard, helpers.providers],
      imports: [helpers.imports]
    });
  });

  it('should ...', inject([AutologinGuard], (guard: AutologinGuard) => {
    expect(guard).toBeTruthy();
  }));
});
