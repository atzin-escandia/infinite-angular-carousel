import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {UpHeaderComponent} from './up-header.component';
import * as helpers from "../../../../../../test/helper";

describe('UpHeaderComponent', () => {
  let component: UpHeaderComponent;
  let fixture: ComponentFixture<UpHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UpHeaderComponent],
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
