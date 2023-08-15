import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TransferState} from '@angular/platform-browser';
import * as helpers from '../../../test/helper';

import {CrossSellingPopoverComponent} from './cross-selling-popover.component';

describe('CrossSellingPopoverComponent', () => {
  let component: CrossSellingPopoverComponent;
  let fixture: ComponentFixture<CrossSellingPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrossSellingPopoverComponent],
      providers: [helpers.popupsProviders, TransferState],
      imports: [helpers.imports],
      schemas: [NO_ERRORS_SCHEMA]
    })
    ;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossSellingPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
