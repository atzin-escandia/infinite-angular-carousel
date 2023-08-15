import {TestBed} from '@angular/core/testing';

import {PromotionsResource} from './promotions.resource';

import * as helpers from '../../../test/helper';

describe('PromotionsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: PromotionsResource = TestBed.inject(PromotionsResource);
    expect(service).toBeTruthy();
  });
});
