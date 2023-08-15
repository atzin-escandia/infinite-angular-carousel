import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomOrderInfoComponent } from './custom-order-info.component';

describe('CustomOrderInfoComponent', () => {
  let component: CustomOrderInfoComponent;
  let fixture: ComponentFixture<CustomOrderInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomOrderInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomOrderInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
