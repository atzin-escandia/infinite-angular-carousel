import { TestBed } from '@angular/core/testing';
import { CheckoutNavigationService } from './navigation.service';

describe('CheckoutNavigationService', () => {
  let service: CheckoutNavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutNavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
