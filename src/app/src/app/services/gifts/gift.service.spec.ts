import {TestBed} from '@angular/core/testing';

import {GiftService} from './gift.service';

import * as helpers from '../../../test/helper';

describe('FeedbackService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: GiftService = TestBed.inject(GiftService);
    expect(service).toBeTruthy();
  });
});
