import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TransferState} from '@angular/platform-browser';
import * as helpers from '../../../test/helper';

import {UpCardMobileComponent} from './up-card-mobile.component';

describe('UpCardMobileComponent', () => {
  let component: UpCardMobileComponent;
  let fixture: ComponentFixture<UpCardMobileComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [UpCardMobileComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpCardMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
