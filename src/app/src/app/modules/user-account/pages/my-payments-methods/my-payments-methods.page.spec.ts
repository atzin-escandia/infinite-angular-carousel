import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPaymentsMethodsPageComponent } from './my-payments-methods.page';

import * as helpers from '../../../../../test/helper';

describe('MyPaymentsMethodsPageComponent', () => {
  let component: MyPaymentsMethodsPageComponent;
  let fixture: ComponentFixture<MyPaymentsMethodsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyPaymentsMethodsPageComponent, helpers.MockComponent({selector: 'cf-button', inputs: ['inverse']})],
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPaymentsMethodsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
