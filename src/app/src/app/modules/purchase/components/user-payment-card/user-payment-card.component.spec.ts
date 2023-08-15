import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPaymentCardComponent } from './user-payment-card.component';

describe('UserPaymentCardComponent', () => {
  let component: UserPaymentCardComponent;
  let fixture: ComponentFixture<UserPaymentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserPaymentCardComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPaymentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
