import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderSealsComponent } from './header-seals.component';


describe('HeaderSealsComponent', () => {
  let component: HeaderSealsComponent;
  let fixture: ComponentFixture<HeaderSealsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderSealsComponent ]
    })
    ;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderSealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
