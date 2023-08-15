import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams, HttpRequest} from '@angular/common/http';
import {environment} from '../../../environments/environment';

import {ApiInterface} from '../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiResource {
  constructor(private http: HttpClient) { }

  /**
   * GET wrapper calle
   */
  public get(options: any): Promise<any> {
    options.method = 'GET';

    return this.call(options);
  }

  /**
   * POST wrapper calle
   */
  public post(options: any): Promise<any> {
    options.method = 'POST';

    return this.call(options);
  }

  /**
   * PUT wrapper calle
   */
  public put(options: any): Promise<any> {
    options.method = 'PUT';

    return this.call(options);
  }

  /**
   * PUT wrapper calle
   */
  public patch(options: any): Promise<any> {
    options.method = 'PATCH';

    return this.call(options);
  }

  /**
   * DELETE wrapper calle
   */
  public delete(options: any): Promise<any> {
    options.method = 'DELETE';

    return this.call(options);
  }

  /**
   * UPLOAD wrapper calle
   */
  public upload(options: any): Promise<any> {
    options.method = 'POST';
    options.fileUpload = true;

    return this.call(options);
  }

  /**
   * Main function to make requests
   */
  protected call(options: any): Promise<any> {
    let url;
    let isBlog = false;

    if (options.loader && typeof window === 'object') {
      window.dispatchEvent(new CustomEvent('loading-animation', {detail: {set: true}}));
    }

    return new Promise((resolve, reject) => {
      let headers = new HttpHeaders();

      options = options || {};
      // Check if servica starts by /
      if (options.service && !options.service.startsWith('/') && !options.service.startsWith('https')) {
        options.service = '/' + options.service;
      }
      let params = new HttpParams();
      const queryParams = {};

      if (options.hasOwnProperty('params')) {
        Object.assign(queryParams, options.params);
      }
      for (const p in queryParams) {
        if (queryParams.hasOwnProperty(p)) {
          params = params.set(p, queryParams[p]);
        }
      }
      if (options.token) {
        headers = headers.set('Authorization', options.token);
      }
      // Compone use
      if (!options.service.startsWith('https') && !options.noApi) {
        switch (options.api) {
          case 'papi':
            url = environment.papi.host + (options.version || environment.papi.default_api_version) + options.service;
            break;
          case 'f2b':
            url = environment.f2b.host + (options.version || environment.f2b.default_api_version) + options.service;
            break;
          default:
            url = environment.capi.host + (options.version || environment.capi.default_api_version) + options.service;
        }
      } else if (!options.noApi) {
        isBlog = true;
        url = options.service;
        params = params.set('wp', 'true');
      } else {
        url = options.service;
      }
      // Compose request
      const requestOptions = new HttpRequest(options.method.toLowerCase(), url, options.body ? options.body : null, {
        headers,
        reportProgress: false,
        params,
        responseType: 'json',
        withCredentials: true
      });

      this.http.request<ApiInterface>(requestOptions).subscribe(
        (event: any) => {
          if (event.type === 4) {
            if (!isBlog) {
              resolve(event.body.data);
            } else {
              resolve(event.body);
            }

          if (options.loader) {
            if (typeof window === 'object') {
              // TODO find a way to abstract this event dispatcher
              window.dispatchEvent(new CustomEvent('loading-animation', {detail: {set: false}}));
            }
          }
        }
      }, (err) => {
        reject(err.error);
        if (options.loader && typeof window === 'object') {
          window.dispatchEvent(new CustomEvent('loading-animation', {detail: {set: false}}));
        }
      });
    });
  }
}
