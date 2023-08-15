import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TransferState} from '@angular/platform-browser';

import {GenericPopupComponent} from './generic-popup';

import * as helpers from '../../../test/helper';

describe('GenericPopupComponent', () => {
  let component: GenericPopupComponent;
  let fixture: ComponentFixture<GenericPopupComponent>;

  beforeEach(() => {
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [GenericPopupComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
