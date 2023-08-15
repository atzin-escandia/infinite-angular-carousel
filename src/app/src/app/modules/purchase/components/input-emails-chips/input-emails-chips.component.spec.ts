import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputEmailsChipsComponent } from './input-emails-chips.component';

describe('InputEmailsChipsComponent', () => {
  let component: InputEmailsChipsComponent;
  let fixture: ComponentFixture<InputEmailsChipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputEmailsChipsComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputEmailsChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
