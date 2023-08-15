import { Injectable, Injector } from '@angular/core';

import { BaseService } from '../base';

@Injectable({
  providedIn: 'root',
})
export class EventService extends BaseService {
  constructor(public injector: Injector) {
    super(injector);
  }

  /**
   * Dispatches events to link to related listeners
   */
  public dispatchEvent(eventName: string, eventDetail: any): void {
    if (typeof window === 'object') {
      window.dispatchEvent(new CustomEvent(eventName, { detail: eventDetail }));
    }
  }
}
