import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomOrderCardContentComponent } from './custom-order-card-content.component';

describe('CustomOrderCardContentComponent', () => {
  let component: CustomOrderCardContentComponent;
  let fixture: ComponentFixture<CustomOrderCardContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomOrderCardContentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomOrderCardContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
