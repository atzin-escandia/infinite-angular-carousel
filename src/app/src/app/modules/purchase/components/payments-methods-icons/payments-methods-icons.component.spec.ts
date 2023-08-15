import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsMethodsIconsComponent } from './payments-methods-icons.component';

describe('PaymentsMethodsIconsComponent', () => {
  let component: PaymentsMethodsIconsComponent;
  let fixture: ComponentFixture<PaymentsMethodsIconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentsMethodsIconsComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentsMethodsIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
