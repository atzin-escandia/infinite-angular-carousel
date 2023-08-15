import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {TechnicalInfoComponent} from './technical-info.component';
import * as helpers from '../../../../../../test/helper';

describe('TechnicalInfoComponent', () => {
  let component: TechnicalInfoComponent;
  let fixture: ComponentFixture<TechnicalInfoComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TechnicalInfoComponent],
        imports: [helpers.imports],
        providers: [helpers.providers]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(TechnicalInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
