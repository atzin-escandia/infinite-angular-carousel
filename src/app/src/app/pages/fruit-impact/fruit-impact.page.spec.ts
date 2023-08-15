import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';

import {FruitImpactPageComponent} from './fruit-impact.page';

import * as helpers from '../../../test/helper';

describe('LandingPageComponent', () => {
  let component: FruitImpactPageComponent;
  let fixture: ComponentFixture<FruitImpactPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FruitImpactPageComponent],
      imports: [helpers.imports],
      providers: [helpers.providers],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FruitImpactPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
