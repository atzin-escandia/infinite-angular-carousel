import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';

import {InvestLandingPageComponent} from './invest-landing-page.page';

import * as helpers from '../../../test/helper';

describe('InvestLandingPageComponent', () => {
  let component: InvestLandingPageComponent;
  let fixture: ComponentFixture<InvestLandingPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InvestLandingPageComponent],
      imports: [helpers.imports],
      providers: [helpers.providers],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
