import { AfterViewInit, Component, OnInit } from '@angular/core';
import { PopupsInterface } from '../popups.interface';
import { PopupsRef } from '../popups.ref';
import { TextService } from '../../services/text';
import { DomService } from '../../services';
import { animate, state, style, transition, trigger } from '@angular/animations';


@Component({
  selector: 'status-popup',
  templateUrl: './status-popup.html',
  styleUrls: ['./status-popup.scss'],
  animations: [
    trigger('visible', [
      state('false', style({ top: '-70px' })),
      state('true', style({ top: 0 })),
      transition('false => true', animate(300 + 'ms ease-in')),
      transition('true => false', animate(300 + 'ms ease-out')),
    ]),
  ],
})
export class StatusPopupComponent implements OnInit, AfterViewInit {
  public err = false;
  public envelope = false;
  public msgSuccess = 'notifications.default-address-updated.text-info';
  public msgError = 'notifications.error-occurred.body';
  public onClose: any;
  public isVisible = false;

  constructor(public config: PopupsInterface, public popup: PopupsRef, public textSrv: TextService, public domSrv: DomService) {}

  ngOnInit(): void {
    // Especial popup || Transparent
    this.domSrv.removeClasses('app', ['blurred']);
    this.domSrv.addClasses('popup-base .overlay', ['overlay-transparent']);

    this.err = this.config.data.err ? this.config.data.err : false;
    this.envelope = this.config.data.envelope ? this.config.data.envelope : false;

    if (this.config.data.msgSuccess) {
      this.msgSuccess = this.textSrv.getText(this.config.data.msgSuccess);
    }

    if (this.config.data.msgError) {
      this.msgError = this.textSrv.getText(this.config.data.msgError);
    }

    setTimeout(() => {
      this.isVisible = false;
      this.onClose();
    }, 7500);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.isVisible = true;
    }, 0);
  }
}
