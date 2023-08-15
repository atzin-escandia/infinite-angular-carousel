import {ComponentFixture, TestBed} from '@angular/core/testing';

import {UpWhatInformationComponent} from '@pages/farmer/up/components';

describe('UpWhatInformationComponent', () => {
  let component: UpWhatInformationComponent;
  let fixture: ComponentFixture<UpWhatInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpWhatInformationComponent]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpWhatInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
