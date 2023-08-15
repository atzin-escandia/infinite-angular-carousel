import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodSelectorComponent } from './payment-method-selector.component';

describe('PaymentMethodSelectorComponent', () => {
  let component: PaymentMethodSelectorComponent;
  let fixture: ComponentFixture<PaymentMethodSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentMethodSelectorComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentMethodSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
