import {TestBed} from '@angular/core/testing';

import {BlogResource} from './blog.resource';

import * as helpers from '../../../test/helper';

describe('BlogService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [helpers.providers],
      imports: [helpers.imports]
    });
  });

  it('should be created', () => {
    const service: BlogResource = TestBed.inject(BlogResource);
    expect(service).toBeTruthy();
  });
});
