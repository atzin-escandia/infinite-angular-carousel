import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoShareBoxesPopupComponent } from './go-share-boxes-popup.component';

describe('GoShareBoxesPopupComponent', () => {
  let component: GoShareBoxesPopupComponent;
  let fixture: ComponentFixture<GoShareBoxesPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ GoShareBoxesPopupComponent ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoShareBoxesPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
