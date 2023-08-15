import { ComponentFixture, TestBed } from '@angular/core/testing';


import * as helpers from '../../../test/helper';
import {GiftUnavailableLandingPageComponent} from './gift-unavailable-landing.page';

describe('ApologyPageComponent', () => {
  let component: GiftUnavailableLandingPageComponent;
  let fixture: ComponentFixture<GiftUnavailableLandingPageComponent>;

  beforeEach(() => {
    void TestBed.configureTestingModule({
      declarations: [GiftUnavailableLandingPageComponent],
      imports: [helpers.imports],
      providers: [helpers.providers]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GiftUnavailableLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
