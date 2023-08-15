import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderUserInfoComponent } from './order-user-info.component';

describe('OrderUserInfoComponent', () => {
  let component: OrderUserInfoComponent;
  let fixture: ComponentFixture<OrderUserInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderUserInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderUserInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
