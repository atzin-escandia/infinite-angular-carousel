import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpHeaderMessagesComponent } from './up-header-messages.component';
import * as helpers from '../../../../../../test/helper';

describe('UpHeaderMessagesComponent', () => {
  let component: UpHeaderMessagesComponent;
  let fixture: ComponentFixture<UpHeaderMessagesComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [ UpHeaderMessagesComponent ],
      providers: helpers.providers,
      imports: helpers.imports
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpHeaderMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
