import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcDetailSkeletonComponent } from './ec-detail-skeleton.component';

describe('EcDetailSkeletonComponent', () => {
  let component: EcDetailSkeletonComponent;
  let fixture: ComponentFixture<EcDetailSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EcDetailSkeletonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EcDetailSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
