import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TransferState} from '@angular/platform-browser';
import * as helpers from '../../../test/helper';

import {SubscribePopoverComponent} from './subscribe-popover';

describe('SubscribePopoverComponent', () => {
  let component: SubscribePopoverComponent;
  let fixture: ComponentFixture<SubscribePopoverComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [SubscribePopoverComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscribePopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
