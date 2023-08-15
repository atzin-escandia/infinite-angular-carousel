import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutShipmentSectionComponent } from './checkout-shipment-section.component';

describe('CheckoutShipmentSectionComponent', () => {
  let component: CheckoutShipmentSectionComponent;
  let fixture: ComponentFixture<CheckoutShipmentSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutShipmentSectionComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutShipmentSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
