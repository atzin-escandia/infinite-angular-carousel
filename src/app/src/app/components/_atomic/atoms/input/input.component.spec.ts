import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomInputComponent } from './input.component';
import * as helpers from '../../../../../test/helper';

describe('CustomInputComponent', () => {
  let component: CustomInputComponent;
  let fixture: ComponentFixture<CustomInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomInputComponent],
      imports: helpers.imports,
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
