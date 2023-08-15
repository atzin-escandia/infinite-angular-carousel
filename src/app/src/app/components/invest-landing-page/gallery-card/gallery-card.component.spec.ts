import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {GalleryCardComponent} from './gallery-card.component';

import {NO_ERRORS_SCHEMA} from '@angular/core';

import * as helpers from '../../../../test/helper';

describe('GalleryCardComponent', () => {
  let component: GalleryCardComponent;
  let fixture: ComponentFixture<GalleryCardComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [GalleryCardComponent],
        imports: [helpers.imports],
        providers: [helpers.providers],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(GalleryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
