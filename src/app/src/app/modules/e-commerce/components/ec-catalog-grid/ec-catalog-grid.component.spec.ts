import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcCatalogGridComponent } from './ec-catalog-grid.component';

describe('EcCatalogGridComponent', () => {
  let component: EcCatalogGridComponent;
  let fixture: ComponentFixture<EcCatalogGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EcCatalogGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EcCatalogGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
