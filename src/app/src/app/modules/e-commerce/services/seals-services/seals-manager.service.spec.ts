import { TestBed } from '@angular/core/testing';

import { SealsManagerService } from './seals-manager.service';

describe('SealsManagerService', () => {
  let service: SealsManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SealsManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
