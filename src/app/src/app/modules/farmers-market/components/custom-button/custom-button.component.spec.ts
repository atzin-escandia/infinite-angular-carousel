import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomButtonComponent } from './custom-button.component';

describe('CfButtonComponent', () => {
  let component: CustomButtonComponent;
  let fixture: ComponentFixture<CustomButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CustomButtonComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
