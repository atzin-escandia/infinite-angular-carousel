import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OhHeaderComponent} from './oh-header.component';
import * as helpers from '../../../../../../test/helper';

describe('OhHeaderComponent', () => {
  let component: OhHeaderComponent;
  let fixture: ComponentFixture<OhHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OhHeaderComponent],
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OhHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
