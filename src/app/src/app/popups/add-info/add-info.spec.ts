import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TransferState} from '@angular/platform-browser';

import {AddInfoComponent} from './add-info.component';

import * as helpers from '../../../test/helper';

describe('AddInfoComponent', () => {
  let component: AddInfoComponent;
  let fixture: ComponentFixture<AddInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddInfoComponent],
      providers: [...helpers.popupsProviders, TransferState],
      imports: helpers.imports,
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
