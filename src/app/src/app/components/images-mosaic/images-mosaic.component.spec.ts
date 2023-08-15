import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesMosaicComponent } from './images-mosaic.component';

describe('ImagesMosaicComponent', () => {
  let component: ImagesMosaicComponent;
  let fixture: ComponentFixture<ImagesMosaicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImagesMosaicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagesMosaicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
