import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TransferState} from '@angular/platform-browser';

import {SealPopupComponent} from './seal-popup';

import * as helpers from '../../../test/helper';

describe('SealPopupComponent', () => {
  let component: SealPopupComponent;
  let fixture: ComponentFixture<SealPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SealPopupComponent],
      providers: [...helpers.popupsProviders, TransferState],
      imports: helpers.imports,
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SealPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
