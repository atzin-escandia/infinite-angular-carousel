import { TestBed } from '@angular/core/testing';
import { PurchaseCoreService } from './purchase.service';
import * as helpers from '../../../../test/helper';

describe('PurchaseCoreService', () => {
  let service: PurchaseCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: helpers.imports,
      providers: [...helpers.providers, ...helpers.purchaseProviders, ...helpers.checkoutProviders],
    });
    service = TestBed.inject(PurchaseCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
