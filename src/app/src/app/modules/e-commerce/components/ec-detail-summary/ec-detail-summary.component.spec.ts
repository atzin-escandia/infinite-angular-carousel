import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcDetailSummaryComponent } from './ec-detail-summary.component';

describe('EcDetailSummaryComponent', () => {
  let component: EcDetailSummaryComponent;
  let fixture: ComponentFixture<EcDetailSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EcDetailSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EcDetailSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
