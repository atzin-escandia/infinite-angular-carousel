import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TransferState} from '@angular/platform-browser';
import * as helpers from '../../../test/helper';

import {LocationLangComponent} from './location-selector.component';

describe('LocationLangComponent', () => {
  let component: LocationLangComponent;
  let fixture: ComponentFixture<LocationLangComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [LocationLangComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationLangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
