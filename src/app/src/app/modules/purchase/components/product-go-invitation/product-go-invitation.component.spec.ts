import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductGoInvitationComponent } from './product-go-invitation.component';

describe('ProductGoInvitationComponent', () => {
  let component: ProductGoInvitationComponent;
  let fixture: ComponentFixture<ProductGoInvitationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductGoInvitationComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductGoInvitationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
