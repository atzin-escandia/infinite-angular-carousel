import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {UpCardComponent} from './up-card.component';

import * as helpers from '../../../../../../test/helper';

describe('UpCardComponent', () => {
  let component: UpCardComponent;
  let fixture: ComponentFixture<UpCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UpCardComponent],
      imports: [helpers.imports],
      providers: [helpers.providers]
    })
      ;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
