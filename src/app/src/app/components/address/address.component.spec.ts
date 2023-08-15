import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AddressComponent} from './address.component';
import * as helpers from '../../../test/helper';

describe('AddressComponent', () => {
  let component: AddressComponent;
  let fixture: ComponentFixture<AddressComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddressComponent, helpers.MockComponent({selector: 'countries-prefix', inputs: ['data']})],
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
