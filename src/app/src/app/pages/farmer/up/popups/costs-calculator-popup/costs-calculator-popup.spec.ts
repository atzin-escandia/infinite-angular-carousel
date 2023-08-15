import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';

import {CostsCalculatorPopupComponent} from './costs-calculator-popup';

import * as helpers from '../../../../../../test/helper';
import {TransferState} from '@angular/platform-browser';

describe('CostsCalculatorPopupComponent', () => {
  let component: CostsCalculatorPopupComponent;
  let fixture: ComponentFixture<CostsCalculatorPopupComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [CostsCalculatorPopupComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(CostsCalculatorPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
