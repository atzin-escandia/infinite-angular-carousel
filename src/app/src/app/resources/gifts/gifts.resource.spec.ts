import {TestBed} from '@angular/core/testing';

import {GiftResource} from './gifts.resource';

import * as helpers from '../../../test/helper';

describe('FeedbackService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: GiftResource = TestBed.inject(GiftResource);
    expect(service).toBeTruthy();
  });
});
