import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitPaymentComponent } from './split-payment.component';
import * as helpers from '../../../../../test/helper';
import { CheckoutService, CheckoutStoreService } from '@modules/purchase/services';

describe('SplitPaymentComponent', () => {
  let component: SplitPaymentComponent;
  let fixture: ComponentFixture<SplitPaymentComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [SplitPaymentComponent],
      providers: [...helpers.providers, CheckoutService, CheckoutStoreService],
      imports: helpers.imports,
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
