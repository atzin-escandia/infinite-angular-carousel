import { TestBed } from '@angular/core/testing';

import { KlarnaService } from './klarna.service';

describe('KlarnaService', () => {
  let service: KlarnaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KlarnaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
