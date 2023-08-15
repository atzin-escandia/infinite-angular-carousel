import { Component, OnInit, OnChanges, Input, Injector, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { CheckDataService, RouterService, UserService } from '@app/services';
import { BaseComponent } from '@components/base';
import { ChangePasswordPopupComponent } from '../../popups/change-password';
import { StatusPopupComponent } from '@popups/status-popup';
import { InfoPopupComponent } from '@popups/info-popup';

@Component({
  selector: 'info-personal',
  templateUrl: './info-personal.component.html',
  styleUrls: ['./info-personal.component.scss'],
})
export class InfoPersonalComponent extends BaseComponent implements OnInit, OnChanges, AfterContentChecked {
  @Input() public user: any;
  @Input() public countries: any;

  public formErrors: any;
  public publicMessage: string;
  public clonedUser: any = {};

  constructor(
    public injector: Injector,
    private routerSrv: RouterService,
    public checkSrv: CheckDataService,
    private userSrv: UserService,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.user && this.initializeForm();
  }

  ngOnChanges(): void {
    const isEmptyClonedUser = !Object.keys(this.clonedUser).length;

    isEmptyClonedUser && this.user && this.initializeForm();
  }

  /**
   * validates form values minumum lenght
   */
  public minLengthIsValid(name: string): void {
    this.formErrors[name] = this.clonedUser[name].length === 0;
  }

  /**
   * Checks if forms inputs are correct
   */
  public formValid(e: any): boolean {
    return this.checkSrv.formValidation(e, true);
  }

  /**
   * Manages user's information update
   */
  public async changeUserInfo(): Promise<any> {
    if (this.formValid(this.formErrors)) {
      const userToSave = { ...this.clonedUser };

      if (!userToSave.phone?.number) {
        userToSave.phone = {};
      }

      try {
        const update = await this.userSrv.updateUserInfo(userToSave);

        if (update) {
          this.popupSrv.open(StatusPopupComponent, {
            data: {
              msgSuccess: 'Basic information saved correctly',
            },
          });
        }
      } catch (error) {
        this.popupSrv.open(StatusPopupComponent, {
          data: {
            err: error,
            msgSuccess: 'error on the action',
          },
        });
      }
    }
  }

  /**
   * Gets selected country prefix
   */
  public getCountryInfo(e: any): void {
    this.clonedUser.phone.prefix = e;
  }

  /**
   * Gets slected language info
   */
  public getLangInfo(e: any): void {
    this.clonedUser.notificationLanguage = e;
  }

  /**
   * Open change password popup
   */
  public changePassword(): void {
    const popup = this.popupSrv.open(ChangePasswordPopupComponent);

    popup.onClose.subscribe((result) => {
      if (result?.msg) {
        this.popupSrv.open(StatusPopupComponent, {
          data: {
            msgSuccess: 'Password successfuly updated',
          },
        });
      }
    });
  }

  public async autoLoginValidation(funcName: string, args?: any[]): Promise<void> {
    const callBack = (): void => {
      if (args) {
        this[funcName](...args);
      } else {
        this[funcName]();
      }
    };

    await this.compCheckLogin(this.user.email, callBack);
  }

  public async handleClickDeleteAccount(): Promise<void> {
    try {
      const { email } = await this.userSrv.get();
      const { canDeleteAccount } = await this.userSrv.checkAccountDeletion(email);

      if (!canDeleteAccount) {
        this.popupSrv.open(InfoPopupComponent, {
          data: {
            title: 'notifications.cannot-delete-account.title',
            description: 'notifications.cannot-delete-account.body',
            buttonLabel: 'global.understood.button',
          },
        });
      } else {
        this.routerSrv.navigate('private-zone/my-account/info/delete-account');
      }
    } catch (error) {
      this.showErrorPopup();
      console.error(error);
    }
  }

  private showErrorPopup(): void {
    this.popupSrv.open(StatusPopupComponent, {
      data: {
        err: true,
      },
    });
  }

  // Need to prevent error
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }

  private initializeForm(): void {
    this.clonedUser = { ...this.user };

    this.formErrors = {
      name: !this.clonedUser.name.length,
      surnames: !this.clonedUser.surnames.length,
    };

    // Adds phone info to user if it doesn't exist.
    this.clonedUser && !this.clonedUser.phone && (this.clonedUser.phone = { number: '', prefix: '' });
  }
}
