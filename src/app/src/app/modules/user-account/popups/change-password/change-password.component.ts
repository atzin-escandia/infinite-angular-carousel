import { Component, OnInit, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { LOCAL_STORAGE_FAVORITE_KEY } from '@interfaces/favourites.interface';
import { PopupsInterface } from '../../../../popups/popups.interface';
import { PopupsRef } from '../../../../popups/popups.ref';
import { AuthService, CheckDataService, FavouriteService, RouterService, StorageService, TextService, UtilsService } from '@app/services';

@Component({
  selector: 'change-password-popup',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordPopupComponent implements OnInit, AfterContentChecked {
  // Form vars
  public oldPassword = '';
  public newPassword = '';
  public confirmPassword = '';
  public formErrors: any;
  public typeInput = 'password';
  public typeInputRep = 'password';

  // Error msg
  public publicMessagePassword = '';

  public onClose: any;

  constructor(
    public config: PopupsInterface,
    public popup: PopupsRef,
    public textSrv: TextService,
    private authSrv: AuthService,
    private cdr: ChangeDetectorRef,
    public utilsSrv: UtilsService,
    public checkSrv: CheckDataService,
    public routerSrv: RouterService,
    public favouriteSrv: FavouriteService,
    private storageSrv: StorageService
  ) {}

  ngOnInit(): void {
    this.formErrors = {
      passSpace: false,
      passLetter: false,
      passNumber: false,
      passLength: false,
      repass: true,
    };
  }

  /**
   * Checks ipunt values onKeyUp
   */
  public validate(type: number, value: string): void {
    if (value && value.length > 2) {
      if (type === 1) {
        this.formErrors.passSpace = !this.checkSrv.passwordIsValid('passSpace', value);
        this.formErrors.passLetter = !this.checkSrv.passwordIsValid('passLetter', value);
        this.formErrors.passNumber = !this.checkSrv.passwordIsValid('passNumber', value);
        this.formErrors.passLength = !this.checkSrv.passwordIsValid('passLength', value, null, 6, 64);
      } else if (type === 2) {
        this.formErrors.repass = !(this.newPassword && this.confirmPassword && this.newPassword === this.confirmPassword);
      }
    }
  }

  /**
   * makes register form overall validation
   */
  public formValid(): boolean {
    return this.newPassword && this.confirmPassword && this.checkSrv.formValidation(this.formErrors, true);
  }

  /**
   * Change password
   */
  public async changePassword(): Promise<void> {
    if (this.formValid()) {
      if (this.config.data.isAutoLogin) {
        // Change password coming from autologin (forgot password)
        try {
          const update = await this.authSrv.changePasswordAutoLogin({
            newPassword: this.newPassword,
            confirmPassword: this.confirmPassword,
          });

          if (update) {
            this.publicMessagePassword = '';
            this.onClose({ msg: this.textSrv.getText('Password change correctly') });
          }

          this.storageSrv.get(LOCAL_STORAGE_FAVORITE_KEY) && this.authSrv.isLogged() && this.favouriteSrv.handleSavedFavourite(true);
        } catch (error) {
          this.publicMessagePassword = this.textSrv.getText(error.msg);
        }
      } else {
        // Change password when logged (old password required)
        try {
          const update = await this.authSrv.changePassword({
            oldPassword: this.oldPassword,
            newPassword: this.newPassword,
            confirmPassword: this.confirmPassword,
          });

          if (update) {
            this.publicMessagePassword = '';
            this.onClose({ msg: this.textSrv.getText('Password change correctly') });
          }

          this.storageSrv.get(LOCAL_STORAGE_FAVORITE_KEY) && this.authSrv.isLogged() && this.favouriteSrv.handleSavedFavourite(true);
        } catch (error) {
          this.publicMessagePassword = this.textSrv.getText(error.msg);
        }
      }
    }
  }

  // Need to prevent error
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }

  public changeVisible(type: string, target: number): void {
    if (target === 1) {
      this.typeInput = type;
    } else {
      this.typeInputRep = type;
    }
  }
}
