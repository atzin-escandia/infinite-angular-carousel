import {TestBed} from '@angular/core/testing';

import {TagsResource} from './tags.resource';

import * as helpers from '../../../../../../test/helper';

describe('TagsResource', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [helpers.providers],
      imports: [helpers.imports]
    });
  });

  it('should be created', () => {
    const service: TagsResource = TestBed.inject(TagsResource);
    expect(service).toBeTruthy();
  });
});
