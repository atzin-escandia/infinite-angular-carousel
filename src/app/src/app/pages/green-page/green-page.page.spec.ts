import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';

import {GreenPageComponent} from './green-page.page';

import * as helpers from '../../../test/helper';

describe('GreenPageComponent', () => {
  let component: GreenPageComponent;
  let fixture: ComponentFixture<GreenPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GreenPageComponent],
      imports: [helpers.imports],
      providers: [helpers.providers],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GreenPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
