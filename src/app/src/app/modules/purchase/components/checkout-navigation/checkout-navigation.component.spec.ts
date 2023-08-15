import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckoutNavigationComponent } from './checkout-navigation.component';

describe('CheckoutNavigationComponent', () => {
  let component: CheckoutNavigationComponent;
  let fixture: ComponentFixture<CheckoutNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutNavigationComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
