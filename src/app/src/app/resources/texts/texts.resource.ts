import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';
import {TextInterface} from '../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class TextsResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  public get(lang: string): Promise<TextInterface[]> {
    return this.apiRsc.get({service: 'texts/lang/' + lang});
  }
}
