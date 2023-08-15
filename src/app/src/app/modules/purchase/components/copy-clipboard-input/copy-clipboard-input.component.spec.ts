import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyClipboardInputComponent } from './copy-clipboard-input.component';

describe('CopyClipboardInputComponent', () => {
  let component: CopyClipboardInputComponent;
  let fixture: ComponentFixture<CopyClipboardInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CopyClipboardInputComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyClipboardInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
