import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutCartSectionComponent } from './checkout-cart-section.component';

describe('CheckoutCartSectionComponent', () => {
  let component: CheckoutCartSectionComponent;
  let fixture: ComponentFixture<CheckoutCartSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutCartSectionComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutCartSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
