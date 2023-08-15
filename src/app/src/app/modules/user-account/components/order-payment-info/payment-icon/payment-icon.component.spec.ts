import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentIconComponent } from './payment-icon.component';

describe('PaymentIconComponent', () => {
  let component: PaymentIconComponent;
  let fixture: ComponentFixture<PaymentIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentIconComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
