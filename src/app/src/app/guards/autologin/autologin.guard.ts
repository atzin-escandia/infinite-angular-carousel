import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';

import {AuthService, RouterService, UserService, TrackingConstants, TrackingService, LoggerService} from '../../services';

// eslint-disable-next-line no-useless-escape
const REGEX = /(http[s]?:\/\/[^\/\s]+\/[^\/\])?([^\/\s]+\/)(.*)/g;
const REGEX_BLOG = /(\/blog\/)/g;
const REGEX_COUNTRY = /(country=)/g;

@Injectable({
  providedIn: 'root'
})
export class AutologinGuard implements CanActivate {
  constructor(
    private authSrv: AuthService,
    private logger: LoggerService,
    private routerSrv: RouterService,
    private userSrv: UserService,
    private trackingSrv: TrackingService
  ) { }

  public async canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<boolean> {
    // Check if params has a hash
    try {
      const param = route?.params?.hash || route?.params?.codedInfo || null;
      const queryParams = route.queryParams || null;

      if (param) {
        const isMkt = route.params.hasOwnProperty('codedInfo');
        const data = await this.authSrv.autoLogin(param, isMkt);

        if (data) {
          const {url, user} = data;
          // Get url to redirect
          const processedUrl = REGEX.exec(url.toString());

          this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.LOGIN, false, {
            userID: user._user,
            lang: processedUrl[1].split('/')[3],
            url: processedUrl[2],
            userType: TrackingConstants.GTM.PARAMS.CROWDFARMER,
            loginType: TrackingConstants.GTM.PARAMS.AUTO
          });

          if (REGEX_BLOG.test(url.toString()) || REGEX_COUNTRY.test(url.toString())) {
            window.location = url;

            return false;
          }

          if (processedUrl) {
            this.routerSrv.navigate(processedUrl[2].toString(), processedUrl[1].split('/')[3], queryParams);
          } else {
            this.routerSrv.navigate('home');
          }
        } else {
          this.routerSrv.navigate('home');
        }
      }
    } catch (error) {
      this.logger.error(error);
      this.routerSrv.navigate('home');

      return true;
    }
  }
}
