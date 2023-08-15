import { Injectable, Injector } from '@angular/core';

import { BaseService } from '../base';
import { FeedbackResource } from '../../resources';

import { FeedbackInterface } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService extends BaseService {
  constructor(private feedbackRsc: FeedbackResource, public injector: Injector) {
    super(injector);
  }

  /**
   * Retrieve feedback
   */
  public async get(): Promise<FeedbackInterface[]> {
    let feedbacks = await this.feedbackRsc.get();

    // Modelize it
    feedbacks = this.modelize(feedbacks, ['_crowdfarmer', '_id', 'highlightHome']);

    return feedbacks;
  }
}
