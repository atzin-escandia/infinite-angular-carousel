import {ComponentFixture, TestBed} from '@angular/core/testing';
import * as helpers from '../../../../../../test/helper';
import {UpHistoryComponent} from './up-history.component';

describe('UpHistoryComponent', () => {
  let component: UpHistoryComponent;
  let fixture: ComponentFixture<UpHistoryComponent>;

    beforeEach( () => {
      TestBed.configureTestingModule({
        declarations: [UpHistoryComponent],
        imports: [helpers.imports],
        providers: [helpers.providers],
      });
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(UpHistoryComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

