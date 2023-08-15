import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { BaseComponent } from '@components/base';

@Component({
  selector: 'home-feedback-block',
  templateUrl: './feedback-block.component.html',
  styleUrls: ['./feedback-block.component.scss'],
})
export class FeedbackBlockComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() feedbacks = [];
  @Input() titleKey = '';
  @Input() asyncLoading = true;

  public currentFeedback = 0;
  public classes: string;
  public feedbackImages = [];
  public areFeedbackLoaded = false;

  constructor(public injector: Injector) {
    super(injector);
  }

  public ngOnInit(): void {
    this.setFeedbackImages();
  }

  public ngOnChanges(): void {
    this.setFeedbackImages();
  }

  private setFeedbackImages(): void {
    this.feedbacks?.map((fb) => {
      this.feedbackImages.push(fb.pictureURL);
    });
    if (this.feedbackImages.length && !this.areFeedbackLoaded) {
      this.areFeedbackLoaded = true;
    }
  }

  /**
   * @param step 1 | -1 | page
   * @param leap Allows direct to page
   */
  public changeFeedback(step: number, leap: boolean = false): void {
    if (leap) {
      this.currentFeedback = step;

      return;
    }

    if ((step < 0 && this.currentFeedback === 0) || (step > 0 && this.currentFeedback >= this.feedbacks.length - 1)) {
      return;
    }
    this.currentFeedback += step;
  }
}
