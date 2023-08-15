import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ImageLazyComponent} from './image-lazy.component';

import * as helpers from '../../../test/helper';

describe('ImageLazyComponent', () => {
  let component: ImageLazyComponent;
  let fixture: ComponentFixture<ImageLazyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImageLazyComponent, helpers.MockComponent({selector: 'countries-prefix', inputs: ['data']})],
      imports: helpers.imports,
      providers: helpers.providers
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageLazyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
