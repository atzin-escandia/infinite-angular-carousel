import { TestBed } from '@angular/core/testing';

import { DatesManagerService } from './dates-manager.service';

describe('DatesManagerService', () => {
  let service: DatesManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatesManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
