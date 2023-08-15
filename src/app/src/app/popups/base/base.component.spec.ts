import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {BaseComponent} from './base.component';

import * as helpers from '../../../test/helper';
import {PopupsRef} from '@popups/popups.ref';

describe('BaseComponent', () => {
  let component: BaseComponent;
  let fixture: ComponentFixture<BaseComponent>;

  beforeEach(() => {
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [BaseComponent],
        providers: [helpers.providers]
      })
        .overrideModule(PopupsRef, {set: {entryComponents: [BaseComponent]}})
        ;
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
