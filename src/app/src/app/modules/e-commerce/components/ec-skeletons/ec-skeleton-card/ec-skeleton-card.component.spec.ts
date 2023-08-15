import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcSkeletonCardComponent } from './ec-skeleton-card.component';

describe('EcSkeletonCardComponent', () => {
  let component: EcSkeletonCardComponent;
  let fixture: ComponentFixture<EcSkeletonCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EcSkeletonCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EcSkeletonCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
