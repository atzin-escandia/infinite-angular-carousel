import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApologyPageComponent } from './apology.page';

import * as helpers from '../../../../test/helper';

describe('ApologyPageComponent', () => {
  let component: ApologyPageComponent;
  let fixture: ComponentFixture<ApologyPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApologyPageComponent],
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApologyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
