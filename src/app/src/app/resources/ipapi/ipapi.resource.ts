import {Injectable} from '@angular/core';
import {HttpClient, HttpBackend} from '@angular/common/http';

import {BaseResource} from '../base';
import {ApiResource} from '../api';

import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IpapiResource extends BaseResource {
  constructor(public apiRsc: ApiResource, private http: HttpClient, private handler: HttpBackend) {
    super(apiRsc);
    this.http = new HttpClient(handler);
  }

  /**
   * Get location throw ipapi
   */
  public async get(): Promise<any> {
    return new Promise((resolve, _reject) => {
      this.http.get(environment.geo.ipapi.url).subscribe(
        (ipData: any) => {
          if (ipData && ipData.data && ipData.data.country) {
            resolve(ipData.data.country.toLowerCase());
          } else {
            resolve(null);
          }
        },
        err => {
          console.error(err);
          resolve('de');
        }
      );
    });
  }
}
