import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutSummaryComponent } from './checkout-summary.component';

describe('CheckoutSummaryComponent', () => {
  let component: CheckoutSummaryComponent;
  let fixture: ComponentFixture<CheckoutSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutSummaryComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
