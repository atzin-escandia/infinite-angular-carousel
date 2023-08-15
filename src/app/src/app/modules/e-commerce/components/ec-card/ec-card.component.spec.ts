import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcCardComponent } from './ec-card.component';

describe('EcCardComponent', () => {
  let component: EcCardComponent;
  let fixture: ComponentFixture<EcCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EcCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EcCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
