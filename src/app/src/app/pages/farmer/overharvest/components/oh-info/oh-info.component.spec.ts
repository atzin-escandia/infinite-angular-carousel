import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {OhInfoComponent} from './oh-info.component';
import * as helpers from '../../../../../../test/helper';

describe('OhInfoComponent', () => {
  let component: OhInfoComponent;
  let fixture: ComponentFixture<OhInfoComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [OhInfoComponent],
        imports: [helpers.imports],
        providers: [helpers.providers]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(OhInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
