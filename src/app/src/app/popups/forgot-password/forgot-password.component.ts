import {Component, AfterContentChecked, ChangeDetectorRef} from '@angular/core';
import {PopupsInterface} from '../popups.interface';
import {PopupsRef} from '../popups.ref';
import {AuthService, CheckDataService, TextService} from '../../services';

@Component({
  selector: 'forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordPopupComponent implements AfterContentChecked {
  public publicMessage = '';
  public email = '';

  public onClose: any;

  constructor(
    public config: PopupsInterface,
    public popup: PopupsRef,
    public textSrv: TextService,
    private authSrv: AuthService,
    private checkSrv: CheckDataService,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Revoer password
   */
  public async recover(): Promise<void> {
    // check email field has data
    if (this.email) {
      // Check email is well-formed
      if (this.checkSrv.emailIsValid(this.email) && !this.checkSrv.inputValidLength(this.email, 0, 64)) {
        try {
          const result = await this.authSrv.recover({email: this.email.toLowerCase()});

          // If result ok dissmiss popup
          if (result) {
            this.onClose({msg: this.textSrv.getText('Password change correctly')});
          }
        } catch (e) {
          // Server error
          this.publicMessage = this.textSrv.getText(e.msg);
        }
      } else {
        this.publicMessage = this.email.length > 64 ?
          this.textSrv.getText('Must be between 1 and 64 characters')
          : this.textSrv.getText('your email is invalid');
      }
    }
  }

  // Need to prevent error
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }
}
