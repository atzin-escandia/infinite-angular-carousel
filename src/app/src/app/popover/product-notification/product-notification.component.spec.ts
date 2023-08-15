import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TransferState} from '@angular/platform-browser';
import * as helpers from '../../../test/helper';

import {ProductNotificationComponent} from './product-notification.component';

describe('ProductNotificationComponent', () => {
  let component: ProductNotificationComponent;
  let fixture: ComponentFixture<ProductNotificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductNotificationComponent],
      providers: [...helpers.popupsProviders, TransferState],
      imports: helpers.imports,
      schemas: [NO_ERRORS_SCHEMA]
    })
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
