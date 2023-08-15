import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FarmersCarouselComponent } from './farmers-carousel.component';
import * as helpers from '../../../../../test/helper';

describe('FarmersCarouselComponent', () => {
  let component: FarmersCarouselComponent;
  let fixture: ComponentFixture<FarmersCarouselComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [FarmersCarouselComponent],
      providers: helpers.providers,
      imports: helpers.imports,
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmersCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
