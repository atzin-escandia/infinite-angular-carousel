import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TransferState} from '@angular/platform-browser';
import * as helpers from '../../../test/helper';

import {FilterPopoverComponent} from './filter-popover';

describe('FilterPopoverComponent', () => {
  let component: FilterPopoverComponent;
  let fixture: ComponentFixture<FilterPopoverComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [FilterPopoverComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
