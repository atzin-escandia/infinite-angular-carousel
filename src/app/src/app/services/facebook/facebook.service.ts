import {Injectable, Injector} from '@angular/core';

import {environment} from '../../../environments/environment';

import {BaseService} from '../base';
import {UtilsService} from '../../services/utils';
import {LangService} from '../../services/lang';
import {AuthResource} from '../../resources/auth';

import {SocialRegisterInterface} from '../../interfaces';

// declare globals out-scope
declare let window: any;
declare let FB: any;

@Injectable({
  providedIn: 'root'
})
export class FacebookService extends BaseService {
  constructor(public injector: Injector, private utilsSrv: UtilsService, private authRsc: AuthResource, private langSrv: LangService) {
    super(injector);
  }

  /**
   * Init facebook lib
   */
  public init(): void {
    this.utilsSrv.loadScript({
      src: environment.facebook.src[this.langSrv.getCurrentLang()],
      defer: true,
      async: true
    });

    // Preapre FB params
    const params = {
      appId: environment.facebook.appId,
      autoLogAppEvents: true,
      xfbml: true,
      version: environment.facebook.version
    };

    // Init FB lib
    window.fbAsyncInit = () => FB.init(params);
  }

  /**
   * Login function
   */
  public async login(): Promise<SocialRegisterInterface> {
    return new Promise((resolve, reject) => {
      window.FB.login(
        r => {
          // No permission given
          if (!r.authResponse) {
            reject('You need to login and give permission to register');
          }

          // Permission given
          window.FB.api('/me', {fields: 'name, email'}, async userData => {
            if (userData.email) {
              // Info to registerSocial.
              const socialData: SocialRegisterInterface = {
                id: userData.id,
                token: r.authResponse.accessToken,
                name: userData.name,
                email: userData.email,
                surnames: userData.name,
                gender: userData.gender ? userData.gender : '',
                birthday: userData.birthday ? userData.birthday : ''
              };

              resolve(await this.authRsc.social({socialData, socialType: 'fb'}));
            } else {
              // If user does not have email #Check
              reject('An email is necessary for social register');
            }
          });
        },
        {scope: 'email'}
      );
    });
  }

  /**
   * Logout function
   */
  public async logout(): Promise<any> {
    return new Promise((resolve, _reject) => window.FB.logout(_r => resolve(true)));
  }
}
