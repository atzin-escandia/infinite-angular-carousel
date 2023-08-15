import {TestBed} from '@angular/core/testing';
import {LandingsResource} from './landings.resource';
import * as helpers from '../../../test/helper';

describe('LandingsResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: LandingsResource = TestBed.inject(LandingsResource);
    expect(service).toBeTruthy();
  });
});
