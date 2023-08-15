import { Injectable, Injector } from '@angular/core';

import { BaseService } from '@services/base';
import { TransferStateService } from '@services/transfer-state';
import { TagsResource } from '../../resources/tags';

let tagsCache: any;

@Injectable({
  providedIn: 'root',
})
export class TagsService extends BaseService {
  constructor(public injector: Injector, private tagsRsc: TagsResource, private transferStateSrv: TransferStateService) {
    super(injector);
  }

  /**
   * Get all tags
   */
  public async getAll(): Promise<any> {
    let tags;

    const stateKey = `tags_all`;

    tags = this.transferStateSrv.get(stateKey, null);

    if (tags === null) {
      if (tagsCache && tagsCache.time && tagsCache.time >= new Date().getTime()) {
        tags = tagsCache.data;
        this.transferStateSrv.set(stateKey, tags);
      } else {
        tags = await this.tagsRsc.getAll();
        this.transferStateSrv.set(stateKey, tags);
        // Store it
        tagsCache = {
          data: tags,
          time: new Date().getTime() + 25000 * 1000,
        };
      }
    }

    // for (let tag of tags.list) {
    //   tag = this.modelize(tag);
    // }
    tags.list = this.modelize(tags.list);

    return tags.list;
  }
}
