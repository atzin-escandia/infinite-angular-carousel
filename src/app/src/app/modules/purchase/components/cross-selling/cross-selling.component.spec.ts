import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrossSellingComponent } from './cross-selling.component';
import * as helpers from '../../../../../test/helper';

describe('CrossSellingComponent', () => {
  let component: CrossSellingComponent;
  let fixture: ComponentFixture<CrossSellingComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [CrossSellingComponent],
      imports: helpers.providers,
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossSellingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
