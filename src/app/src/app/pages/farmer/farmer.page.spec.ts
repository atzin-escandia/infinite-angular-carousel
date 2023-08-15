import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {FarmerPageComponent} from './farmer.page';

import * as helpers from '../../../test/helper';

describe('FarmerComponent', () => {
  let component: FarmerPageComponent;
  let fixture: ComponentFixture<FarmerPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FarmerPageComponent],
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
