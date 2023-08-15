import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ImageGalleryComponent} from './image-gallery.component';

import * as helpers from '../../../test/helper';

describe('ImageGalleryComponent', () => {
  let component: ImageGalleryComponent;
  let fixture: ComponentFixture<ImageGalleryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImageGalleryComponent, helpers.MockComponent({selector: 'countries-prefix', inputs: ['data']})],
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
