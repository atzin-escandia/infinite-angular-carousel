import {Injectable} from '@angular/core';

import {BaseResource} from '../base';
import {ApiResource} from '../api';
import {LangService} from '../../services/lang';
import {StorageService} from '../../services/storage';
import {ReasonRegistration} from '../../interfaces/user-register.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthResource extends BaseResource {
  constructor(public apiRsc: ApiResource, private langSrv: LangService, private storageSrv: StorageService) {
    super(apiRsc);
  }

  /**
   * Fech user info from server
   */
  public getMe(token?: string): Promise<any> {
    return this.apiRsc.post({service: 'crowdfarmers/me', token});
  }

  /**
   * Login service against server
   */
  public login(body: any): Promise<any> {
    return this.apiRsc.post({service: 'crowdfarmers/login', body, loader: true});
  }

  /**
   * Login service against server
   */
  public async checkToken(token: string): Promise<any> {
    return await this.apiRsc.get({service: 'users/auth/valid/' + token, loader: true});
  }

  /**
   * Login service against server
   */
  public autoLogin(hash: string): Promise<any> {
    return this.apiRsc.get({service: 'users/auth/' + hash});
  }

  /**
   * Login service against server
   */
  public autoLoginMktCloud(codedInfo: string): Promise<any> {
    return this.apiRsc.get({service: 'users/auth/mkt-cloud/' + codedInfo});
  }

  /**
   * Register service against server
   */
  public register(body: any): Promise<any> {
    return this.apiRsc.post({service: 'crowdfarmers', body, loader: true});
  }

  /**
   * Register service against server
   */
  public social(body: any): Promise<any> {
    const urlParams = new URLSearchParams(window.location.search);
    let reason: ReasonRegistration;

    body.modelData = {
      name: body.socialData.name,
      email: body.socialData.email,
      surnames: body.socialData.surnames || body.socialData.name,
      notificationLanguage: this.langSrv.getCurrentLang(),
      registrationInfo: {
        url: window.location.href
      },
      social: {
        [body.socialType]: {
          gender: body.socialData.gender ? body.socialData.gender : '',
          birthday: body.socialData.birthday ? body.socialData.birthday : ''
        }
      }
    };

    if (urlParams.has('go')) {
      reason = {
        type: 'GROUP_ORDER_INVITATION',
        id: urlParams.get('go')
      };
    }

    if (reason) {
      body.modelData.registrationInfo = {
        ...body.modelData.registrationInfo,
        reason,
      };
    }

    return this.apiRsc.post({service: 'crowdfarmers/social-login-register', body, loader: true});
  }

  /**
   * Soft Register service against server
   */
  public soft(body: any): Promise<any> {
    return this.apiRsc.post({service: 'crowdfarmers/soft', body, loader: true});
  }

  /**
   * Recover access
   */
  public recover(body: any): Promise<any> {
    return this.apiRsc.post({service: 'users/auth/forgot', body});
  }

  /**
   * Changes user password
   */
  public changePassword(body: any): Promise<any> {
    return this.apiRsc.post({service: '/users/password', body, loader: true});
  }

  /**
   * Get user
   */
  public getBan(): Promise<any> {
    return this.apiRsc.post({service: '/users/ban'});
  }

  /**
   * Changes user password AutoLogin
   */
  public changePasswordAutoLogin(body: any): Promise<any> {
    return this.apiRsc.post({service: '/users/password/ignore', body, loader: true});
  }

  /**
   * Get Google user from server
   */
  public async getGoogleUser(body: { token: string }): Promise<any> {
    return this.apiRsc.post({service: 'users/auth/google', body, loader: true});
  }
}
