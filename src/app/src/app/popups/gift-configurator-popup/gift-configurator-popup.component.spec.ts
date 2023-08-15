import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftConfiguratorPopupComponent } from './gift-configurator-popup.component';

describe('GiftConfiguratorPopupComponent', () => {
  let component: GiftConfiguratorPopupComponent;
  let fixture: ComponentFixture<GiftConfiguratorPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GiftConfiguratorPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GiftConfiguratorPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
