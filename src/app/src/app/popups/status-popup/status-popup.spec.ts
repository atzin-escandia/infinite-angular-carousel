import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';

import {StatusPopupComponent} from './status-popup';

import * as helpers from '../../../test/helper';
import {TransferState} from '@angular/platform-browser';

describe('StatusPopupComponent', () => {
  let component: StatusPopupComponent;
  let fixture: ComponentFixture<StatusPopupComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [StatusPopupComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
