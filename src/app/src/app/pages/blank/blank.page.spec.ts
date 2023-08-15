import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import * as helpers from '../../../test/helper';

import {BlankPageComponent} from './blank.page';

describe('BlankPageComponent', () => {
  let component: BlankPageComponent;
  let fixture: ComponentFixture<BlankPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      declarations: [BlankPageComponent],
      providers: [helpers.providers]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlankPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
