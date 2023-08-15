import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PopoverBaseComponent} from './base.component';

import * as helpers from '../../../test/helper';

describe('PopoverBaseComponent', () => {
  let component: PopoverBaseComponent;
  let fixture: ComponentFixture<PopoverBaseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopoverBaseComponent],
      imports: helpers.imports,
      providers: helpers.providers,
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopoverBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
