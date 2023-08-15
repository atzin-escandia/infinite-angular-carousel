import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TransferState} from '@angular/platform-browser';
import * as helpers from '../../../test/helper';

import {AccordionPopoverComponent} from './accordion-popover';

describe('AccordionPopoverComponent', () => {
  let component: AccordionPopoverComponent;
  let fixture: ComponentFixture<AccordionPopoverComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [AccordionPopoverComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccordionPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
