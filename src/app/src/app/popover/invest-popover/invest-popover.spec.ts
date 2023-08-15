import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TransferState} from '@angular/platform-browser';
import * as helpers from '../../../test/helper';

import {InvestPopoverComponent} from './invest-popover';

describe('InvestPopoverComponent', () => {
  let component: InvestPopoverComponent;
  let fixture: ComponentFixture<InvestPopoverComponent>;

  beforeEach( () => {
    TestBed.configureTestingModule({
      declarations: [InvestPopoverComponent],
      providers: [...helpers.popupsProviders, ...helpers.providers,TransferState],
      imports: [helpers.imports],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
