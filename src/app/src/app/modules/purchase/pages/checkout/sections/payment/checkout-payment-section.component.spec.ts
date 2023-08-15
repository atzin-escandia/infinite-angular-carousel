import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutPaymentSectionComponent } from './checkout-payment-section.component';

describe('CheckoutPaymentSectionComponent', () => {
  let component: CheckoutPaymentSectionComponent;
  let fixture: ComponentFixture<CheckoutPaymentSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutPaymentSectionComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutPaymentSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
