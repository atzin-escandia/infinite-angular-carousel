import {TestBed} from '@angular/core/testing';

import {FeedbackResource} from './feedback.resource';

import * as helpers from '../../../test/helper';

describe('FeedbackService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: FeedbackResource = TestBed.inject(FeedbackResource);
    expect(service).toBeTruthy();
  });
});
