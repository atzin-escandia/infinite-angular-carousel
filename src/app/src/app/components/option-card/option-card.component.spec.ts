import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {OptionCardComponent} from './option-card.component';

import * as helpers from '../../../test/helper';

describe('OptionCardComponent', () => {
  let component: OptionCardComponent;
  let fixture: ComponentFixture<OptionCardComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [OptionCardComponent, helpers.MockComponent({selector: 'countries-prefix', inputs: ['data']})],
        imports: [helpers.imports],
        providers: [helpers.providers]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
