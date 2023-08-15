import {TestBed} from '@angular/core/testing';

import {TagsService} from './tags.service';

import * as helpers from '../../../../../../test/helper';

describe('TagsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: TagsService = TestBed.inject(TagsService);
    expect(service).toBeTruthy();
  });
});
