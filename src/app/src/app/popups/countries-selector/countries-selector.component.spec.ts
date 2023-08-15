import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';

import {CountriesPopupComponent} from './countries-selector.component';

import * as helpers from '../../../test/helper';
import {TransferState} from '@angular/platform-browser';

describe('CountriesPopupComponent', () => {
  let component: CountriesPopupComponent;
  let fixture: ComponentFixture<CountriesPopupComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [CountriesPopupComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(CountriesPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
