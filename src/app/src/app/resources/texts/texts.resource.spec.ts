import {TestBed} from '@angular/core/testing';

import {TextsResource} from './texts.resource';

import * as helpers from '../../../test/helper';

describe('TextsResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: TextsResource = TestBed.inject(TextsResource);
    expect(service).toBeTruthy();
  });
});
