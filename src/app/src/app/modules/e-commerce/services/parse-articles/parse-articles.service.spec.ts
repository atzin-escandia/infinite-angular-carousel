import { TestBed } from '@angular/core/testing';

import { ParseArticlesService } from './parse-articles.service';

describe('ParseArticlesService', () => {
  let service: ParseArticlesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParseArticlesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
