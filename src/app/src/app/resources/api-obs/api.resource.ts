import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';

import { catchError, finalize, map, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiInterface } from '@app/interfaces';
import { OptionsApi } from './interfaces/options.interface';

@Injectable({
  providedIn: 'root',
})
export class ApiResource {
  constructor(private http: HttpClient) {}

  /**
   * GET wrapper calle
   */
  public get(options: OptionsApi): Observable<any> {
    options.method = 'get';

    return this.call(options);
  }

  /**
   * POST wrapper calle
   */
  public post(options: OptionsApi): Observable<any> {
    options.method = 'post';

    return this.call(options);
  }

  /**
   * PUT wrapper calle
   */
  public put(options: OptionsApi): Observable<any> {
    options.method = 'put';

    return this.call(options);
  }

  /**
   * PUT wrapper calle
   */
  public patch(options: OptionsApi): Observable<any> {
    options.method = 'patch';

    return this.call(options);
  }

  /**
   * DELETE wrapper calle
   */
  public delete(options: OptionsApi): Observable<any> {
    options.method = 'delete';

    return this.call(options);
  }

  /**
   * UPLOAD wrapper calle
   */
  public upload(options: OptionsApi): Observable<any> {
    options.method = 'POST';
    options.fileUpload = true;

    return this.call(options);
  }

  /**
   * Main function to make requests
   */
  // eslint-disable-next-line complexity
  protected call(options: OptionsApi): Observable<any> {
    let url = '';
    let isBlog = false;

    this.showLoader(options.loader);

    let headers = new HttpHeaders();

    options = options || {};
    // Check if servica starts by /
    if (options.service && !options.service.startsWith('/') && !options.service.startsWith('https')) {
      options.service = '/' + options.service;
    }

    // Add Query params
    let queryParams = new HttpParams();
    const queryParamsAux = {};

    if (options.hasOwnProperty('queryParams')) {
      Object.assign(queryParamsAux, options.params);
    }
    for (const p in queryParamsAux) {
      if (queryParamsAux.hasOwnProperty(p)) {
        queryParams = queryParams.set(p, queryParamsAux[p]);
      }
    }
    if (options.token) {
      headers = headers.set('Authorization', options.token);
    }
    // Compone use
    if (!options.service.startsWith('https') && !options.noApi) {
      const apis = {
        papi: environment.papi.host + (options.version || environment.papi.default_api_version) + options.service,
        catapi: environment.catapi.host + (options.version || environment.catapi.default_api_version) + options.service,
        f2b: environment.f2b.host + (options.version || environment.f2b.default_api_version) + options.service,
      };
      const defaultApi = environment.capi.host + (options.version || environment.capi.default_api_version) + options.service;

      url = apis[options.api] || defaultApi;
    } else if (!options.noApi) {
      isBlog = true;
      url = options.service;
      queryParams = queryParams.set('wp', 'true');
    } else {
      url = options.service;
    }

    return this.createCall(url, options, queryParams, headers).pipe(
      map((response: any) => {
        if (!isBlog) {
          return response.data;
        } else {
          return response;
        }
      }),
      tap({
        error: () => {
          this.hideLoader(options?.loader);
        },
      }),
      finalize(() => {
        this.hideLoader(options?.loader);
      }),
      catchError((er) => this.handleError(er))
    );
  }

  createCall(url: string, options: OptionsApi, queryParams: HttpParams, headers: HttpHeaders): Observable<any> {
    let params = '';

    if (options.params?.length) {
      options.params.forEach((param) => {
        params = params + `/${encodeURIComponent(String(param))}`;
      });
    }

    const typesCall = {
      get: this.http.get(`${url}${params}`, {
        params: queryParams,
        headers,
      }),
      put: this.http.put(`${url}${params}`, options.body, {
        params: queryParams,
        headers,
      }),
      post: this.http.post(`${url}${params}`, options.body, {
        params: queryParams,
        headers,
      }),
      patch: this.http.patch(`${url}${params}`, options.body, {
        params: queryParams,
        headers,
      }),
      delete: this.http.delete(`${url}${params}`, {
        params: queryParams,
        headers,
        body: options.body,
      }),
    };

    return typesCall[options.method];
  }

  showLoader(isloader: boolean): void {
    if (isloader && typeof window === 'object') {
      window.dispatchEvent(new CustomEvent('loading-animation', { detail: { set: true } }));
    }
  }

  hideLoader(isloader: boolean): void {
    if (isloader && typeof window === 'object') {
      window.dispatchEvent(new CustomEvent('loading-animation', { detail: { set: false } }));
    }
  }

  /**
   * handleError
   * return handle Error
   *
   * @param error
   * @returns
   */
  public handleError(error: Response): Observable<any> {
    // console.error('An error occurred', error); // for demo purposes only
    return throwError(() => error || 'server error');
  }
}
