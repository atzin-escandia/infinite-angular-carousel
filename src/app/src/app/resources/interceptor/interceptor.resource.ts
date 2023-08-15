import {Inject, Injectable, InjectionToken, PLATFORM_ID} from '@angular/core';
import {HttpInterceptor, HttpRequest, HttpResponse, HttpHandler, HttpEvent} from '@angular/common/http';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

import {BaseResource} from '../base';
import {ApiResource} from '../api';
import {StorageService, LangService, AuthService, DomService} from '../../services';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InterceptorResource extends BaseResource implements HttpInterceptor {
  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: InjectionToken<any>,
    public apiRsc: ApiResource,
    private storageSrv: StorageService,
    private langSrv: LangService,
    private authSrv: AuthService,
    private domSrv: DomService,
  ) {
    super(apiRsc);
  }

  /**
   * Req Interceptor
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isCfApi = request.url.includes('dev.cf-tech') ||
      request.url.startsWith(`${environment.mainDomain}/api`) ||
      request.url.startsWith(`${environment.mainDomain}/services`);

    if (isCfApi || environment.env === 'dev') {
      const token: string = this.authSrv.getCurrentToken();
      const sessionId = this.storageSrv.get('sessionId', 2);
      const currentCountry = this.storageSrv.get('location') || null;

      request = request.clone({
        headers: request.headers
          .set('Accept-Language', this.langSrv.getCurrentLang())
          .set('X-Version', environment.VERSION)
          .set('X-Origin-CF', environment.mainDomain)
          .set('X-Country', currentCountry || 'Not detected')
      });

      if (!(request.url.includes('tickets/add-photos') || request.url.includes('contacts/add-photos'))) {
        request = request.clone({headers: request.headers.set('Accept', 'application/json').set('Content-Type', 'application/json')});
      }
      if (this.domSrv.isPlatformBrowser()) {
        const deviceId = this.storageSrv.getDeviceId();

        if (deviceId) {
          request = request.clone({headers: request.headers.set('X-Device-CF', deviceId)});
        }

        if (this.authSrv.isLogged()) {
          request = request.clone({headers: request.headers.set('Authorization', token)});
        }

        if (sessionId) {
          request = request.clone({headers: request.headers.set('X-SessionId', sessionId)});
        }
      }
    }

    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          this.checkAuth(event);
        }

        return event;
      }),
      (error: any) =>
        // TODO: Handle errors
        error
    );
  }

  /**
   * Check auth requests
   */
  private checkAuth(event): void {
    try {
      if (this.domSrv.isPlatformBrowser()) {
        const isMeCall = event?.url?.endsWith('/crowdfarmers/me');

        if (isMeCall && this.authSrv.isLogged()) {
          const token = event?.headers?.get('X-Auth-Token');
          const user = event?.body?.data;

          this.authSrv.refreshAuthInfo(user, token);
        }
      }
    } catch (e) {

    }
  }
}
