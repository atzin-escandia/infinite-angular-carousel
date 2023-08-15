import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';

import {PromosSortPopupComponent} from './promos-sort.component';

import * as helpers from '../../../test/helper';
import {TransferState} from '@angular/platform-browser';

describe('PromosSortPopupComponent', () => {
  let component: PromosSortPopupComponent;
  let fixture: ComponentFixture<PromosSortPopupComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [PromosSortPopupComponent],
        providers: [helpers.popupsProviders, TransferState],
        imports: [helpers.imports],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromosSortPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
