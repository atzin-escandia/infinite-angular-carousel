import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TransferState} from '@angular/platform-browser';

import {BannedPayComponent} from './banned-pay';

import * as helpers from '../../../test/helper';

describe('BannedPayComponent', () => {
  let component: BannedPayComponent;
  let fixture: ComponentFixture<BannedPayComponent>;

  beforeEach(() => {
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [BannedPayComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BannedPayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
