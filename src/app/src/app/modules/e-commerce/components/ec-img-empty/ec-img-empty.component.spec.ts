import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcImgEmptyComponent } from './ec-img-empty.component';

describe('EcImgEmptyComponent', () => {
  let component: EcImgEmptyComponent;
  let fixture: ComponentFixture<EcImgEmptyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EcImgEmptyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcImgEmptyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
