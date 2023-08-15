import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplePaymentComponent } from './apple-payment.component';
import * as helpers from '../../../../../../../test/helper';

describe('ApplePaymentComponent', () => {
  let component: ApplePaymentComponent;
  let fixture: ComponentFixture<ApplePaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApplePaymentComponent],
      imports: helpers.imports,
      providers: [...helpers.providers, ...helpers.purchaseProviders, ...helpers.checkoutProviders],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
