import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThanksPageComponent } from './thanks.page';

import * as helpers from '../../../../test/helper';

describe('ThanksPageComponent', () => {
  let component: ThanksPageComponent;
  let fixture: ComponentFixture<ThanksPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ThanksPageComponent],
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThanksPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
