import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {FeedbackBlockComponent} from './feedback-block.component';

import * as helpers from '../../../../test/helper';

describe('FeedbackBlockComponent', () => {
  let component: FeedbackBlockComponent;
  let fixture: ComponentFixture<FeedbackBlockComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackBlockComponent],
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Functionality => ', () => {
    beforeEach(() => {
      component.feedbacks = [{}, {}, {}, {}];
    });

    it('Should start at the first review', () => {
      expect(component.feedbacks.length).toBe(4);
    });

    it('Should swap between feedbacks', () => {
      component.changeFeedback(1);
      expect(component.currentFeedback).toBe(1);

      component.changeFeedback(-1);
      expect(component.currentFeedback).toBe(0);
    });

    it('should skip to the last review', () => {
      component.changeFeedback(2, true);
      expect(component.currentFeedback).toBe(2);
    });
  });
});
