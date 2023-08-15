import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';

import {ToSPageComponent} from './tos.page';

import * as helpers from '../../../test/helper';

describe('ToSPageComponent', () => {
  let component: ToSPageComponent;
  let fixture: ComponentFixture<ToSPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ToSPageComponent],
      imports: [helpers.imports],
      providers: [helpers.providers],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToSPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
