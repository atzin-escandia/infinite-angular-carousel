import {NO_ERRORS_SCHEMA} from '@angular/core';

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {AddressPopupValidatorComponent} from './address-popup-validator.component';

import * as helpers from '../../../test/helper';

describe('AdressValidator', () => {
  let component: AddressPopupValidatorComponent;
  let fixture: ComponentFixture<AddressPopupValidatorComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [AddressPopupValidatorComponent],
        imports: [helpers.imports],
        providers: [helpers.providers],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressPopupValidatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
