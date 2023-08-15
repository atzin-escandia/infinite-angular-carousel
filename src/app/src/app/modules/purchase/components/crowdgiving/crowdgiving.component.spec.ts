import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrowdgivingComponent } from './crowdgiving.component';

describe('CrowdgivingComponent', () => {
  let component: CrowdgivingComponent;
  let fixture: ComponentFixture<CrowdgivingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrowdgivingComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrowdgivingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
