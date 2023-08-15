import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TransferState} from '@angular/platform-browser';

import {CrosssellingNameComponent} from './crossselling-name';

import * as helpers from '../../../test/helper';

describe('CrosssellingNameComponent', () => {
  let component: CrosssellingNameComponent;
  let fixture: ComponentFixture<CrosssellingNameComponent>;

  beforeEach(() => {
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CrosssellingNameComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrosssellingNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
