import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TransferState} from '@angular/platform-browser';
import * as helpers from '../../../test/helper';

import {ForgotPasswordPopupComponent} from './forgot-password.component';

describe('ForgotPasswordPopupComponent', () => {
  let component: ForgotPasswordPopupComponent;
  let fixture: ComponentFixture<ForgotPasswordPopupComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [ForgotPasswordPopupComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotPasswordPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
