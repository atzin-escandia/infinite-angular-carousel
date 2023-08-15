import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullListToggleComponent } from './full-list-toggle.component';

describe('FullListToggleComponent', () => {
  let component: FullListToggleComponent;
  let fixture: ComponentFixture<FullListToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FullListToggleComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FullListToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
