import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomBoxSummaryComponent } from './custom-box-summary.component';

describe('CustomBoxSummaryComponent', () => {
  let component: CustomBoxSummaryComponent;
  let fixture: ComponentFixture<CustomBoxSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomBoxSummaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomBoxSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
