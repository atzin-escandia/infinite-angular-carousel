import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossSellingProductComponent } from './cross-selling-product.component';

describe('CrossSellingProductComponent', () => {
  let component: CrossSellingProductComponent;
  let fixture: ComponentFixture<CrossSellingProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrossSellingProductComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossSellingProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
