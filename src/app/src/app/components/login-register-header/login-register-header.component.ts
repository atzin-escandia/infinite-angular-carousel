import {Component, Injector} from '@angular/core';
import {BaseComponent} from '../base';

@Component({
  selector: 'login-register-header',
  templateUrl: './login-register-header.component.html',
  styleUrls: ['./login-register-header.component.scss']
})
export class LoginRegisterHeaderComponent extends BaseComponent {
  constructor(public injector: Injector) {
    super(injector);
  }
}
