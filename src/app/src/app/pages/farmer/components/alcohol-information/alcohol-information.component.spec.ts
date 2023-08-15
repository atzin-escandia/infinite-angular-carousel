import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlcoholInformationComponent } from './alcohol-information.component';

describe('AlcoholInformationComponent', () => {
  let component: AlcoholInformationComponent;
  let fixture: ComponentFixture<AlcoholInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlcoholInformationComponent ]
    })
    ;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlcoholInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
