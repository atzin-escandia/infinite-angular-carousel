import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OverharvestPageComponent} from './overharvest.page';

import * as helpers from '../../../../test/helper';

describe('OverharvestPageComponent', () => {
  let component: OverharvestPageComponent;
  let fixture: ComponentFixture<OverharvestPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OverharvestPageComponent],
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverharvestPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
