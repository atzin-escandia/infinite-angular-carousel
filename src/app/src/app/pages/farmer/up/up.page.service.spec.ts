import { TestBed } from '@angular/core/testing';

import { UpPageService } from './up.page.service';
import * as helpers from '../../../../test/helper';

describe('Up.PageService', () => {
  let service: UpPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers],
    });
    service = TestBed.inject(UpPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
