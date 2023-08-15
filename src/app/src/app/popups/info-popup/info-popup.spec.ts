import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { InfoPopupComponent } from './info-popup';

import * as helpers from '../../../test/helper';
import { TransferState } from '@angular/platform-browser';

describe('ConfirmationPopupComponent', () => {
  let component: InfoPopupComponent;
  let fixture: ComponentFixture<InfoPopupComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [InfoPopupComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
