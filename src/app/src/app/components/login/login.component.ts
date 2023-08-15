import { Component, Injector, Input, Output, EventEmitter, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { CheckDataService } from '@app/services';
import { BaseComponent } from '../base';
import { ForgotPasswordPopupComponent } from '@popups/forgot-password';
import { GenericPopupComponent } from '@popups/generic-popup';
import { SocialKey } from '@app/interfaces';

@Component({
  selector: 'login-component',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends BaseComponent implements AfterContentChecked {
  @Input() fb: boolean;
  @Input() google: boolean;

  @Output() returnUserData = new EventEmitter<any>();

  typeInput: string;

  public user: any = {
    type: 1,
    email: '',
    password: ''
  };

  public errorIn: any = {
    email: false,
    password: false
  };

  constructor(
    private cdr: ChangeDetectorRef,
    public checkSrv: CheckDataService,
    public injector: Injector,
  ) {
    super(injector);
    this.typeInput = 'password';
  }

  // Need to prevent error
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }

  /**
   * Emit information to login function in login-register page
   */
  public login(): void {
    const isFormValid =  !this.errorIn.email && !this.errorIn.password;

    if (isFormValid) {
      this.returnUserData.emit(this.user);
    }
  }

  /**
   * Recover access function
   */
  public recoverAccess(): void {
    const popup = this.popupSrv.open(ForgotPasswordPopupComponent);

    popup.onClose.subscribe(result => {
      if (result) {
        this.popupSrv.open(GenericPopupComponent, {
          data: {
            id: 'forgot-password',
            msg: this.textSrv.getText('We have send you an email for remember your pass')
          }
        });
      }
    });
  }

  /**
   * Handles social login
   */
  buttonSelectHandler(): void {
    this.returnUserData.emit({ type: 2 });
  }

  /**
   *Check validation inputs
   */
  public checkInput(field: string, start: boolean = false): void {
    if (start || this.errorIn[field]) {
      const input = this.user[field];

      switch (field) {
        case 'email':
          this.errorIn[field] = !this.checkSrv.emailIsValid(input) || this.checkSrv.inputValidLength(input, 0, 64);
          break;
        case 'password':
          this.errorIn[field] = this.checkSrv.inputValidLength(input, 6, 64);
          break;
      }
    }
  }

  public changeVisible(type: string): void {
    this.typeInput = type;
  }
}
