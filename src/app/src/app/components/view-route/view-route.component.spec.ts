import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRouteComponent } from './view-route.component';

describe('ViewRouteComponent', () => {
  let component: ViewRouteComponent;
  let fixture: ComponentFixture<ViewRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewRouteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
