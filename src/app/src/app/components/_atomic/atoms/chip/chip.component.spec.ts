import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomChipComponent } from './chip.component';

describe('CustomChipComponent', () => {
  let component: CustomChipComponent;
  let fixture: ComponentFixture<CustomChipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomChipComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
