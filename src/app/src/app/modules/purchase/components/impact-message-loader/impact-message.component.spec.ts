import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpactMessageLoaderComponent } from './impact-message-loader.component';

describe('ImpactMessageLoaderComponent ', () => {
  let component: ImpactMessageLoaderComponent ;
  let fixture: ComponentFixture<ImpactMessageLoaderComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImpactMessageLoaderComponent ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImpactMessageLoaderComponent );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
