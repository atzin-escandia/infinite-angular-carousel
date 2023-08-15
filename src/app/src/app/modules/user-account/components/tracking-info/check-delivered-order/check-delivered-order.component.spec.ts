import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckDeliveredOrderComponent } from './check-delivered-order.component';

describe('CheckDeliveredOrderComponent', () => {
  let component: CheckDeliveredOrderComponent;
  let fixture: ComponentFixture<CheckDeliveredOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckDeliveredOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckDeliveredOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
