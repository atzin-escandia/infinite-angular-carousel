import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingManifestComponent } from './landing-manifest.page';

import { NO_ERRORS_SCHEMA } from '@angular/core';

import * as helpers from '../../../test/helper';

describe('LandingManifestComponent', () => {
  let component: LandingManifestComponent;
  let fixture: ComponentFixture<LandingManifestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LandingManifestComponent],
      imports: [helpers.imports],
      providers: [helpers.providers],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingManifestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
