import {ComponentFixture, TestBed, inject} from '@angular/core/testing';
import {Injector, NO_ERRORS_SCHEMA} from '@angular/core';

import {HomePageComponent} from './home.page';

import * as helpers from '../../../test/helper';

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomePageComponent],
      imports: [helpers.imports],
      providers: [helpers.providers],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(inject([Injector], (__injector: Injector) => {
    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
