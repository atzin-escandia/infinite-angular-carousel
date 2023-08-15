import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapsableCardComponent } from './collapsable-card.component';

describe('CollapsableCardComponent', () => {
  let component: CollapsableCardComponent;
  let fixture: ComponentFixture<CollapsableCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollapsableCardComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollapsableCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
