import {TestBed} from '@angular/core/testing';

import {AntifraudResource} from './antifraud.resource';

import * as helpers from '../../../test/helper';

describe('antifraudSrv', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: AntifraudResource = TestBed.inject(AntifraudResource);
    expect(service).toBeTruthy();
  });
});
