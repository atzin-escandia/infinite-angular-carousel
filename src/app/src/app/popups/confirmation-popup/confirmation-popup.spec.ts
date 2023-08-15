import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ConfirmationPopupComponent } from './confirmation-popup';

import * as helpers from '../../../test/helper';
import { TransferState } from '@angular/platform-browser';

describe('ConfirmationPopupComponent', () => {
  let component: ConfirmationPopupComponent;
  let fixture: ComponentFixture<ConfirmationPopupComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [ConfirmationPopupComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
