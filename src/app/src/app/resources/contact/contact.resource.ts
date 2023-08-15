import {Injectable} from '@angular/core';
import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class ContactResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * makes call to save contact
   */
  public saveContact(contactBody: any): Promise<any> {
    return this.apiRsc.post({service: 'contacts', body: {contactBody}});
  }

  /**
   * Upload photos to the system
   */
  public addPhotos(body: any): Promise<any> {
    return this.apiRsc.post({service: 'contacts/add-photos', body});
  }
}
