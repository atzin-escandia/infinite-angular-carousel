import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTooltipComponent } from './tooltip.component';

describe('CustomTooltipComponent', () => {
  let component: CustomTooltipComponent;
  let fixture: ComponentFixture<CustomTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomTooltipComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
