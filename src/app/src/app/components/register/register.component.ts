import {
  Component,
  OnInit,
  Injector,
  Input,
  Output,
  EventEmitter,
  AfterContentChecked,
  ChangeDetectorRef,
  ViewEncapsulation
} from '@angular/core';
import {BaseComponent} from '../base';
import {SocialKey, UserRegisterInterface} from '@app/interfaces';
import {CheckDataService} from '@app/services';

@Component({
  selector: 'register-component',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent extends BaseComponent implements OnInit, AfterContentChecked {
  @Input() public user: UserRegisterInterface;
  @Output() public returnUserData = new EventEmitter<any>();
  @Input() google: boolean;
  @Input() fb: boolean;

  public typeInput: string;

  public errorIn: any = {
    passSpace: false,
    passLetter: false,
    passNumber: false,
    passLength: false,
    email: false,
    privacy: false,
    name: false,
    surnames: false
  };

  public privacy: any;
  public checkPrivacy = false;

  constructor(public injector: Injector, private cdr: ChangeDetectorRef, private checkSrv: CheckDataService) {
    super(injector);
    this.typeInput = 'password';
  }

  ngOnInit(): void {
    this.user.type = 1;

    // In case the email and name came from welcomeSoft
    if (this.user.email) {
      this.checkInput('email');
    }

    if (this.user.name) {
      this.checkInput('name');
    }
  }

  /**
   * validates form values minumum lenght
   */
  public checkInput(field: string, start = false): void {
    if (start || this.errorIn[field]) {
      const input = this.user[field];

      switch (field) {
        case 'name':
        case 'surnames':
          this.errorIn[field] = this.checkSrv.inputValidLength(input, 0, 30);
          break;
        case 'email':
          this.errorIn[field] = !this.checkSrv.emailIsValid(input) || this.checkSrv.inputValidLength(input, 0, 64);
          break;
      }
    }
  }

  /**
   * validates password
   */
  public passwordIsValid(start: boolean = false): void {
    if (
      start ||
      this.errorIn.passLength ||
      this.errorIn.passSpace ||
      this.errorIn.passLetter ||
      this.errorIn.passNumber
    ) {
      this.errorIn.passLength = !this.checkSrv.passwordIsValid('passLength', this.user.password, null, 6, 64);
      this.errorIn.passSpace = !this.checkSrv.passwordIsValid('passSpace', this.user.password);
      this.errorIn.passLetter = !this.checkSrv.passwordIsValid('passLetter', this.user.password);
      this.errorIn.passNumber = !this.checkSrv.passwordIsValid('passNumber', this.user.password);
    }
  }

  /**
   * toggles value of privaci variable
   */
  public privacyIsValid(): void {
    this.errorIn.privacy = !this.privacy;
  }

  /**
   * makes register form overall validation
   */
  public formValid(): boolean {
    return (
      this.user &&
      this.user.email &&
      this.user.password &&
      this.user.surnames &&
      this.user.name &&
      this.privacy &&
      this.checkSrv.formValidation(this.errorIn, true)
    );
  }

  /**
   * Emit information to register function in login-register page
   */
  public register(): void {
    this.testEveryField();
    this.formValid() && this.returnUserData.emit(this.user);
  }

  /**
   * Handles social register
   */
  public buttonSelectHandler(): void {
    this.returnUserData.emit({ type: 2 });
  }

  public testEveryField(): void {
    this.checkInput('name', true);
    this.checkInput('surnames', true);
    this.checkInput('emailIsValid', true);
    this.passwordIsValid(true);
    this.privacyIsValid();
  }

  // Need to prevent error
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }

  public changeVisible(type: string): void {
    this.typeInput = type;
  }
}
