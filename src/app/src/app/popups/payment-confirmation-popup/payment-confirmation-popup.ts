import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PopupsInterface } from '../popups.interface';
import { PopupsRef } from '../popups.ref';
import { DomService } from '../../services';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'payment-confirmation-popup',
  templateUrl: './payment-confirmation-popup.html',
  styleUrls: ['./payment-confirmation-popup.scss'],
})
export class PaymentConfirmationPopupComponent implements OnInit {
  public title: string;
  public icon: string;
  public isBodyHTML = false;
  public body: SafeHtml | string;
  public confirm: string;
  public canCancel = false;
  public onClose: any;
  public cancelText: string;

  constructor(
    private config: PopupsInterface,
    private popup: PopupsRef,
    private sanitizer: DomSanitizer,
    public domSrv: DomService,
    public translocoSrv: TranslocoService
  ) {}

  ngOnInit(): void {
    this.title = this.translocoSrv.translate(this.config.data.title);
    this.icon = this.config.data.icon;
    this.isBodyHTML = this.config.data.isBodyHTML || false;
    this.body = this.isBodyHTML ?
      this.sanitizer.bypassSecurityTrustHtml(this.config.data.body) :
      this.translocoSrv.translate(this.config.data.body);
    this.confirm = this.translocoSrv.translate(this.config.data.confirm || 'global.accept.tab');
    this.canCancel = this.translocoSrv.translate(this.config.data.canCancel) || false;
    this.cancelText = this.translocoSrv.translate('global.cancel.button');
  }
}
