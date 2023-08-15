import { TestBed } from '@angular/core/testing';

import { SealsService } from './seals.service';

describe('SealsService', () => {
  let service: SealsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SealsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
