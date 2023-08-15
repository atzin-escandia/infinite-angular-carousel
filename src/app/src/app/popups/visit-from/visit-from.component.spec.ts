import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TransferState} from '@angular/platform-browser';

import * as helpers from '../../../test/helper';
import {VisitFromComponent} from './visit-from.component';

describe('SealPopupComponent', () => {
  let component: VisitFromComponent;
  let fixture: ComponentFixture<VisitFromComponent>;

  beforeEach(() => {
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [VisitFromComponent],
        providers: [...helpers.popupsProviders, TransferState],
        imports: helpers.imports,
        schemas: [NO_ERRORS_SCHEMA]
      });
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitFromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
