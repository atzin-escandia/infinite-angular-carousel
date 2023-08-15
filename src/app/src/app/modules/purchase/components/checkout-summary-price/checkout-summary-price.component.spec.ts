import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutSummaryPriceComponent } from './checkout-summary-price.component';

describe('CheckoutSummaryPriceComponent', () => {
  let component: CheckoutSummaryPriceComponent;
  let fixture: ComponentFixture<CheckoutSummaryPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutSummaryPriceComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutSummaryPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
