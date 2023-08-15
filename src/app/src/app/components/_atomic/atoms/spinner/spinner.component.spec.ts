import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomSpinnerComponent } from './spinner.component';

describe('CustomSpinnerComponent', () => {
  let component: CustomSpinnerComponent;
  let fixture: ComponentFixture<CustomSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomSpinnerComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
