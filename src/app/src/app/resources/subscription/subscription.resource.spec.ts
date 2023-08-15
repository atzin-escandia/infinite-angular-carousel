import {TestBed} from '@angular/core/testing';

import {SubscriptionResource} from './subscription.resource';

import * as helpers from '../../../test/helper';

describe('SubscriptionResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: SubscriptionResource = TestBed.inject(SubscriptionResource);
    expect(service).toBeTruthy();
  });
});
