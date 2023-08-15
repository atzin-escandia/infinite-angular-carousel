import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcDrawerModalWrapperComponent } from './ec-drawer-modal-wrapper.component';

describe('EcDrawerModalWrapperComponent', () => {
  let component: EcDrawerModalWrapperComponent;
  let fixture: ComponentFixture<EcDrawerModalWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EcDrawerModalWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EcDrawerModalWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
