import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnavailableComponent } from './unavailable.page';

describe('UnavailableComponent', () => {
  let component: UnavailableComponent;
  let fixture: ComponentFixture<UnavailableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnavailableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnavailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
