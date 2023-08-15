import { Injectable, Injector } from '@angular/core';
import { BaseService } from '../base';
import { ContactResource } from '../../resources';

@Injectable({
  providedIn: 'root',
})
export class ContactService extends BaseService {
  constructor(private contactRsc: ContactResource, public injector: Injector) {
    super(injector);
  }

  /**
   * Makes contact
   */
  public async saveContact(contactBody: any): Promise<any> {
    if (contactBody.imageUrls) {
      const fd = new FormData();

      fd.append('container', 'contacts');
      fd.append('enctype', 'multipart/form-data');
      contactBody.imageUrls.map((file: any) => {
        fd.append('images', file, file.name);
      });
      contactBody.imageUrls = await this.contactRsc.addPhotos(fd);
    }

    return this.contactRsc.saveContact(contactBody);
  }
}
