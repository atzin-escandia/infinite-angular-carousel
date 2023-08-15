import {Component, EventEmitter, Injector, Output} from '@angular/core';
import {BaseComponent} from '../base';

@Component({
  selector: 'toggle-password-component',
  templateUrl: './toggle-password.component.html',
  styleUrls: ['./toggle-password.component.scss']
})
export class TogglePasswordComponent extends BaseComponent {
  public seePass: boolean;
  public typeInput: string;
  @Output() typeInputE = new EventEmitter<string>();

  constructor(
    public injector: Injector,
  ) {
    super(injector);
    this.seePass = true;
    this.typeInput = 'password';
  }

  public changeVisible(): void {
    this.typeInput = this.seePass ? 'text' : 'password';
    this.seePass = !this.seePass;
    this.typeInputE.emit(this.typeInput);
  }
}
