import { Injectable, Injector } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BaseService, LoggerService, TextService, AuthService } from '..';
import { PopupService } from '../popup';
import { BannedPayComponent } from '../../popups/banned-pay';
import { GenericPopupComponent } from '../../popups/generic-popup';

@Injectable({
  providedIn: 'root',
})
export class PermisionService extends BaseService implements CanActivate {
  private userRefreshed = false;
  private ban: any;

  private timesOpened = 0;

  constructor(
    private authSrv: AuthService,
    private popupSrv: PopupService,
    private textSrv: TextService,
    public injector: Injector,
    private logger: LoggerService
  ) {
    super(injector);
  }

  /**
   * Guard function
   */
  public async canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<boolean> {
    try {
      if (!this.authSrv.isLogged()) {
        return true;
      }

      if (!this.userRefreshed) {
        this.ban = await this.authSrv.getBan();
        this.userRefreshed = true;
      }

      if (!this.ban.isBanned) {
        return true;
      }

      // Ban for declined payment
      if (this.ban.isDeclined) {
        if (route.url.some((segment) => segment.path === 'order')) {
          this.popupSrv.open(GenericPopupComponent, {
            data: {
              msg: this.textSrv.getText('Your account its currently suspended and you can not access the confirm order. Contact with us'),
              id: 'suspended-account',
            },
          });

          return false;
        } else {
          // Not as expected, but works -> Can't be closed
          this.popupSrv.open(BannedPayComponent);
        }
      }

      return true;
    } catch (e) {
      this.logger.error(e);

      return true;
    }
  }

  /**
   * Handle for child routes
   */
  public async canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return await this.canActivate(route, state);
  }
}
