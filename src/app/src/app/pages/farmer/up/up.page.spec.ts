import {ComponentFixture, TestBed} from '@angular/core/testing';

import {UpPageComponent} from './up.page';

import * as helpers from '../../../../test/helper';

describe('UpPageComponent', () => {
  let component: UpPageComponent;
  let fixture: ComponentFixture<UpPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpPageComponent],
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
