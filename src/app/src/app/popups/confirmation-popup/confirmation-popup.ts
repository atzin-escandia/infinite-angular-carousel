import { Component, OnInit } from '@angular/core';

import { PopupsInterface } from '../popups.interface';
import { PopupsRef } from '../popups.ref';
import { DomService, TextService } from '../../services';
import {TranslocoService} from '@ngneat/transloco';

@Component({
  selector: 'confirmation-popup',
  templateUrl: './confirmation-popup.html',
  styleUrls: ['./confirmation-popup.scss']
})
export class ConfirmationPopupComponent implements OnInit {
  public title: string;
  public msg: string;

  public subMsg: string;
  public advise: string;

  public okAction: string;
  public cancelAction: string;

  public onClose: any;

  public showCancelButton = false;

  public goHideMsg = false;

  constructor(
    public config: PopupsInterface,
    public popup: PopupsRef,
    public textSrv: TextService,
    public domSrv: DomService,
    public translocoSrv: TranslocoService
    ) { }

  ngOnInit(): void {
    const {advise, title, msg, subMsg, showCancelButton, okAction, cancelAction, goHideMsg} = this.config.data;

    this.title = this.translocoSrv.translate(title);

    this.advise = this.translocoSrv.translate(advise);

    this.goHideMsg = goHideMsg;

    if (msg) {
      this.msg = this.translocoSrv.translate(msg);
    }
    if (subMsg) {
      this.subMsg = this.translocoSrv.translate(subMsg);
    }

    if (showCancelButton) {
      this.showCancelButton = showCancelButton;
    }

    this.okAction = this.translocoSrv.translate(okAction) || this.translocoSrv.translate('global.accept.tab');
    this.cancelAction = this.translocoSrv.translate(cancelAction) || this.translocoSrv.translate('global.cancel.button');
  }
}
