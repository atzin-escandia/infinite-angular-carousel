import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';

import {LandingBuilderComponent} from './landing-builder.page';

import * as helpers from '../../../test/helper';

describe('LandingBuilderComponent', () => {
  let component: LandingBuilderComponent;
  let fixture: ComponentFixture<LandingBuilderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LandingBuilderComponent],
      imports: [helpers.imports],
      providers: [helpers.providers],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
