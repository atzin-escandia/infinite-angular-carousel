import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcInfoBannerComponent } from './ec-info-banner.component';

describe('EcInfoBannerComponent', () => {
  let component: EcInfoBannerComponent;
  let fixture: ComponentFixture<EcInfoBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EcInfoBannerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EcInfoBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
