import {Injector} from '@angular/core';
import {
  TextService,
  LangService,
  UtilsService,
  DomService,
  StorageService,
  UserService,
  LoggerService
} from '@app/services';
import {PopupService} from '@services/popup';
import {PopoverService} from '@services/popover';
import {ForgotPasswordPopupComponent} from '@popups/forgot-password';
import {GenericPopupComponent} from '@popups/generic-popup';
import {environment} from '../../../environments/environment';
import {LoginPopupComponent} from '@app/popups/login-popup/login-popup.component';

export abstract class BaseComponent {
  public textSrv: TextService;
  public env = environment;
  public langSrv: LangService;
  public utilsSrv: UtilsService;
  public domSrv: DomService;
  public popupSrv: PopupService;
  public popoverSrv: PopoverService;
  public storageSrv: StorageService;
  public userService: UserService;
  public loggerSrv: LoggerService;

  constructor(public injector: Injector) {
    this.textSrv = this.injector.get(TextService);
    this.langSrv = this.injector.get(LangService);
    this.utilsSrv = this.injector.get(UtilsService);
    this.domSrv = this.injector.get(DomService);
    this.popupSrv = this.injector.get(PopupService);
    this.popoverSrv = this.injector.get(PopoverService);
    this.storageSrv = this.injector.get(StorageService);
    this.userService = this.injector.get(UserService);
    this.loggerSrv = this.injector.get(LoggerService);
  }

  /**
   * Triggers function only if
   */
  public async compCheckLogin(email: string, cb: () => void, errorCb?: () => void): Promise<void> {
    if (this.userService.isAutoLogged()) {
      const socialAcc = await this.userService.getIsSocial(this.userService.getCurrentUser()?._id);

      const loginPopup = this.popupSrv.open(LoginPopupComponent, {
        data: {
          email,
          socialAcc,
          autoLoginMsg: this.textSrv.getText('You need to login to continue'),
          loginCallback: (err: any) => {
            if (!err) {
              this.userService.toggleAutoLogin(false);
              cb();
            } else {
              if (errorCb) {
                errorCb();
              }
            }
          }
        }
      });

      loginPopup.onClose.subscribe((result: string) => {
        if (result === 'recoverAccess') {
          const popup = this.popupSrv.open(ForgotPasswordPopupComponent);

          popup.onClose.subscribe((answer: any) => {
            if (answer) {
              this.popupSrv.open(GenericPopupComponent, {
                data: {
                  id: 'forgot-password',
                  msg: this.textSrv.getText('We have send you an email for remember your pass')
                }
              });
            }
          });
        }
      });
    } else {
      cb();
    }
  }
}
