import { TestBed } from '@angular/core/testing';
import { CheckoutPaymentIdealService } from './ideal.service';
import * as helpers from '../../../../../../test/helper';
import { PurchaseServicesModule } from '@modules/purchase/services/purchase.module';

describe('CheckoutPaymentIdealService', () => {
  let service: CheckoutPaymentIdealService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers, PurchaseServicesModule],
    });
    service = TestBed.inject(CheckoutPaymentIdealService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
