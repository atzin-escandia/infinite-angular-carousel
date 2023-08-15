import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TransferState} from '@angular/platform-browser';

import {LoginPopupComponent} from './login.component';

import * as helpers from '../../../test/helper';

describe('LoginPopupComponent', () => {
  let component: LoginPopupComponent;
  let fixture: ComponentFixture<LoginPopupComponent>;

  beforeEach(() => {
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [LoginPopupComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
