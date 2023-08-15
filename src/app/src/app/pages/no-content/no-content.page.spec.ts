import {ComponentFixture, TestBed} from '@angular/core/testing';

import {NoContentPageComponent} from './no-content.page';

import * as helpers from '../../../test/helper';

describe('NoContentPageComponent', () => {
  let component: NoContentPageComponent;
  let fixture: ComponentFixture<NoContentPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NoContentPageComponent],
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoContentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
