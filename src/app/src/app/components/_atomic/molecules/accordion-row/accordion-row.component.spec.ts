import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionRowComponent } from './accordion-row.component';

describe('AccordionRowComponent', () => {
  let component: AccordionRowComponent;
  let fixture: ComponentFixture<AccordionRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccordionRowComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccordionRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
