import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export class UpResource extends BaseResource {
  constructor(public apiRsc: ApiResource) {
    super(apiRsc);
  }

  /**
   * Get up by slug
   */
  public getBySlug(slug: string, country?: string): Promise<any> {
    return this.apiRsc.get({
      service: `ups/by-slug/${slug}/`,
      params: {country},
      version: 'v2'
    });
  }

  /**
   * Get up by slug full data
   */
  public getBySlugFull(slug: string, country: string): Promise<any> {
    return this.apiRsc.get({
      service: `ups/by-slug-info/${slug}/${country}`,
      version: 'v2'
    });
  }

  /**
   * Get up by id
   */
  public get(id: string): Promise<any> {
    return this.apiRsc.get({service: 'ups/by-id/' + id});
  }

  /**
   * Get upCf by id
   */
  public getUpCf(id: string): Promise<any> {
    return this.apiRsc.get({service: 'up-cfs/public/' + id});
  }

  /**
   * Get upCf certificate by id
   */
  public getUpCfCert(id: string): Promise<any> {
    return this.apiRsc.get({service: 'up-cfs/cert/' + id});
  }

  /**
   * Edit upCf certificate
   */
  public editUpCfCert(id: string, body: any): Promise<any> {
    return this.apiRsc.post({service: 'up-cfs/cert/' + id, body});
  }

  /**
   * Get upCf profile by id
   */
  public getUpCfProfile(id: string): Promise<any> {
    return this.apiRsc.get({service: 'up-cfs/profile/' + id});
  }

  /**
   * Get active upd
   */
  public activeUps(): Promise<any> {
    return this.apiRsc.get({service: 'ups/active'});
  }

  /**
   * Get masterBox upd
   */
  public getMasterBox(id: string): Promise<any> {
    return this.apiRsc.get({service: 'master-boxes/' + id});
  }

  /**
   * Get categories
   */
  public async getCategories(): Promise<any> {
    const categories = await this.apiRsc.get({service: '/categories/', params: {order: 'code', asc: 'true'}});

    return categories.list;
  }

  /*
   * Gets if an order can be cancelled.
   * @param id
   */
  public liberatableUp(id: string): Promise<any> {
    return this.apiRsc.get({service: 'up-cfs/liberatable/' + id});
  }

  /**
   * Liberate adoption
   */
  public liberate(id: string): Promise<any> {
    return this.apiRsc.put({service: 'up-cfs/' + id + '/liberate'});
  }

  /**
   * Autorenew toggle
   */
  public toggleAutoRenew(id: string, autoRenew: boolean): Promise<any> {
    return this.apiRsc.put({service: 'up-cfs/' + id + '/autorenew', body: {autoRenew}});
  }
}
