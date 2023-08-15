import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SepaPaymentComponent } from './sepa-payment.component';

describe('SepaPaymentComponent', () => {
  let component: SepaPaymentComponent;
  let fixture: ComponentFixture<SepaPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SepaPaymentComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SepaPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
