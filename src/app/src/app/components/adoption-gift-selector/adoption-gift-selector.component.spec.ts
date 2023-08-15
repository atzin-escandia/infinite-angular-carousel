import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdoptionGiftSelectorComponent } from './adoption-gift-selector.component';

describe('AdoptionGiftSelectorComponent', () => {
  let component: AdoptionGiftSelectorComponent;
  let fixture: ComponentFixture<AdoptionGiftSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdoptionGiftSelectorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdoptionGiftSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
