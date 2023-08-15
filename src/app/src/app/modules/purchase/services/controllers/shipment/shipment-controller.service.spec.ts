import { TestBed } from '@angular/core/testing';
import { CheckoutShipmentControllerService } from './shipment-controller.service';

describe('CheckoutShipmentControllerService', () => {
  let service: CheckoutShipmentControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutShipmentControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
