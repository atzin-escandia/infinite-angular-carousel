import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoInvitationPageComponent } from './go-invitation.component';

describe('GoInvitationPageComponent', () => {
  let component: GoInvitationPageComponent;
  let fixture: ComponentFixture<GoInvitationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GoInvitationPageComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoInvitationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
