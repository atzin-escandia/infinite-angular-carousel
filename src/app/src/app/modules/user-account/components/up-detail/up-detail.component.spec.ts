/* eslint-disable @typescript-eslint/unbound-method */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import * as helpers from '../../../../../test/helper';
import { UpDetailComponent } from './up-detail.component';

describe('UpDetailComponent', () => {
  let component: UpDetailComponent;
  let fixture: ComponentFixture<UpDetailComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [UpDetailComponent],
        imports: [helpers.imports],
        providers: [helpers.providers],
        schemas: [NO_ERRORS_SCHEMA]
      });
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.paginate).toBeTruthy();
    expect(component.onScroll).toBeTruthy();
    expect(component.sizeConfig).toBeTruthy();
  });

  describe('check functions', () => {
    beforeEach(() => {
      component.totalPages = 2;
    });

    it('changes varibles values for pagination', () => {
      component.paginate(0);

      expect(component.currentPage).toEqual(2);
      expect(component.start).toEqual(10);
    });

    it('restarts valiables values on resize', () => {
      void component.sizeConfig();

      expect(component.currentPage).toEqual(1);
      expect(component.start).toEqual(0);
    });
  });
});
