import {Injectable} from '@angular/core';
import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class InstagramResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Get posts
   */
  public getPost(): Promise<any> {
    return this.apiRsc.get('https://graph.instagram.com/me/media?fields=id,caption&access_token=IGQVJ...');
  }

}
