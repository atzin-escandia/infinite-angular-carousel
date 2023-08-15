import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';

import {DownloadAppPageComponent} from './download-app.page';

import * as helpers from '../../../test/helper';

describe('LandingPageComponent', () => {
  let component: DownloadAppPageComponent;
  let fixture: ComponentFixture<DownloadAppPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DownloadAppPageComponent],
      imports: [helpers.imports],
      providers: [helpers.providers],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadAppPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
