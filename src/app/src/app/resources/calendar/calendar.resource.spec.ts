import {TestBed} from '@angular/core/testing';

import {CalendarResource} from './calendar.resource';

import * as helpers from '../../../test/helper';

describe('CalendarResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: CalendarResource = TestBed.inject(CalendarResource);
    expect(service).toBeTruthy();
  });
});
