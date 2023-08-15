import { TestBed } from '@angular/core/testing';
import { CheckoutAnalyticsService } from './analytics.service';

describe('CheckoutAnalyticsService', () => {
  let service: CheckoutAnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutAnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
