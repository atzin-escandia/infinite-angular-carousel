import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';

import {SoftRegisterPopupComponent} from '././soft-register.component';

import * as helpers from '../../../test/helper';
import {TransferState} from '@angular/platform-browser';

describe('SoftRegisterPopupComponent', () => {
  let component: SoftRegisterPopupComponent;
  let fixture: ComponentFixture<SoftRegisterPopupComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [SoftRegisterPopupComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(SoftRegisterPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
