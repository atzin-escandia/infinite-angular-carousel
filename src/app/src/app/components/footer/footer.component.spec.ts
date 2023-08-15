import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {FooterComponent} from './footer.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';

import * as helpers from '../../../test/helper';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FooterComponent, helpers.MockComponent({selector: 'cf-button', inputs: ['small']})],
      imports: [helpers.imports],
      providers: [helpers.providers],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
