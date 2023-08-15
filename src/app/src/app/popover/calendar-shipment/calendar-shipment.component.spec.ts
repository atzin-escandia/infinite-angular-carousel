import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TransferState} from '@angular/platform-browser';
import * as helpers from '../../../test/helper';

import {CalendarShipmentComponent} from './calendar-shipment.component';

describe('CalendarShipmentComponent', () => {
  let component: CalendarShipmentComponent;
  let fixture: ComponentFixture<CalendarShipmentComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [CalendarShipmentComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarShipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
