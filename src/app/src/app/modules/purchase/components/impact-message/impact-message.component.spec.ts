import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImpactMessageComponent } from './impact-message.component';

describe('ImpactMessageComponent', () => {
  let component: ImpactMessageComponent;
  let fixture: ComponentFixture<ImpactMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImpactMessageComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImpactMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
