import {ComponentFixture, TestBed, inject} from '@angular/core/testing';
import {Injector, NO_ERRORS_SCHEMA} from '@angular/core';

import {LoginRegisterPageComponent} from './login-register.page';

import * as helpers from '../../../test/helper';

describe('LoginRegisterPageComponent', () => {
  let component: LoginRegisterPageComponent;
  let fixture: ComponentFixture<LoginRegisterPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginRegisterPageComponent],
      imports: [helpers.imports],
      providers: [helpers.providers],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(inject([Injector], (__injector: Injector) => {
    fixture = TestBed.createComponent(LoginRegisterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
