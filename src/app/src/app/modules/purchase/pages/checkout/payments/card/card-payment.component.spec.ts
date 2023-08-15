import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardPaymentComponent } from './card-payment.component';
import * as helpers from '../../../../../../../test/helper';

describe('CardPaymentComponent', () => {
  let component: CardPaymentComponent;
  let fixture: ComponentFixture<CardPaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CardPaymentComponent],
      imports: helpers.imports,
      providers: helpers.providers,
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
