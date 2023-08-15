import {Component, Injector, Input} from '@angular/core';
import {BaseComponent} from '../base';
import {CheckDataService} from '@app/services';

@Component({
  selector: 'password-tos',
  templateUrl: './password-tos.component.html',
  styleUrls: ['./password-tos.component.scss']
})
export class PasswordTosComponent extends BaseComponent {
  @Input() newUser: any;
  @Input() errorIn: any;

  public triedPurchase = false;

  constructor(public injector: Injector, private checkSrv: CheckDataService) {
    super(injector);
  }

  /**
   * validates password
   */
  public passwordIsValid(): void {
    this.errorIn.passSpace = !this.checkSrv.passwordIsValid('passSpace', this.newUser.password);
    this.errorIn.passLetter = !this.checkSrv.passwordIsValid('passLetter', this.newUser.password);
    this.errorIn.passNumber = !this.checkSrv.passwordIsValid('passNumber', this.newUser.password);
    this.errorIn.passLength = !this.checkSrv.passwordIsValid('passLength', this.newUser.password, null, 6, 64);
  }

  /**
   * checks if password is equal to repassword
   */
  public repasswordIsValid(): void {
    this.errorIn.repass = this.newUser.password !== this.newUser.repassword;
  }

  public manageInput(key: string): void {
    if (key === 'email') {
      this.errorIn.email = !this.checkSrv.emailIsValid(this.newUser.email);
    }
  }
}
