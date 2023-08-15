import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ImageAndTextGalleryComponent} from './image-and-text-gallery.component';
import * as helpers from '../../../../test/helper';

describe('ImageAndTextGalleryComponent', () => {
  let component: ImageAndTextGalleryComponent;
  let fixture: ComponentFixture<ImageAndTextGalleryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImageAndTextGalleryComponent],
      imports: helpers.imports,
      providers: helpers.providers
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageAndTextGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
