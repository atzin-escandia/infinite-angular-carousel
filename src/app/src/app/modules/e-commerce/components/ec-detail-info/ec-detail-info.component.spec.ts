import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcDetailInfoComponent } from './ec-detail-info.component';

describe('EcDetailInfoComponent', () => {
  let component: EcDetailInfoComponent;
  let fixture: ComponentFixture<EcDetailInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EcDetailInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EcDetailInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
