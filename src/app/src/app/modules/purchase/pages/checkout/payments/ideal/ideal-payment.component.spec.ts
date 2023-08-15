import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdealPaymentComponent } from './ideal-payment.component';

describe('IdealPaymentComponent', () => {
  let component: IdealPaymentComponent;
  let fixture: ComponentFixture<IdealPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IdealPaymentComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdealPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
