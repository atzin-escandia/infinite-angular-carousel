import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TransferState} from '@angular/platform-browser';

import {OrderAddressPopupComponent} from './order-address-popup';

import * as helpers from '../../../test/helper';

describe('OrderAddressPopupComponent', () => {
  let component: OrderAddressPopupComponent;
  let fixture: ComponentFixture<OrderAddressPopupComponent>;

  beforeEach(() => {
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [OrderAddressPopupComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderAddressPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
