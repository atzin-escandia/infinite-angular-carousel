import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ECommerceComponent } from './e-commerce.page';

describe('ECommerceComponent', () => {
  let component: ECommerceComponent;
  let fixture: ComponentFixture<ECommerceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ECommerceComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ECommerceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
