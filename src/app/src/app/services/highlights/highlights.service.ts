import { Injectable, Injector } from '@angular/core';
import {HighlightsResource} from '../../resources';

import { BaseService } from '../base/base.service';

@Injectable({
  providedIn: 'root'
})
export class HighlightsService extends BaseService {
  constructor(public injector: Injector, private highlightsRsc: HighlightsResource) {
    super(injector);
  }

  // Mandatory implementation
  public init = (): void => null;

  public async getHighlights(): Promise<any> {

    let highlights = await this.highlightsRsc.getHighlights();

    highlights = this.modelize(highlights);
    highlights.sort((a, b) => a.position - b.position);

    return highlights;
  }
}
