import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';

import {SubscriptionPopupComponent} from './subscription-popup.component';

import * as helpers from '../../../test/helper';
import {TransferState} from '@angular/platform-browser';

describe('ConfirmationPopupComponent', () => {
  let component: SubscriptionPopupComponent;
  let fixture: ComponentFixture<SubscriptionPopupComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [SubscriptionPopupComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
