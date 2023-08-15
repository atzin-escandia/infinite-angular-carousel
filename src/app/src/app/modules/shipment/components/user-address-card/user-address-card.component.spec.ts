import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserAddressCardComponent } from '@modules/purchase/components';
import * as helpers from '../../../../../test/helper';

describe('UserAddressCardComponent', () => {
  let component: UserAddressCardComponent;
  let fixture: ComponentFixture<UserAddressCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserAddressCardComponent],
      imports: helpers.imports,
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAddressCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
