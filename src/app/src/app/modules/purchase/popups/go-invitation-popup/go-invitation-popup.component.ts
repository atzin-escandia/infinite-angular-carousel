import { Component, OnInit } from '@angular/core';
import { IPurchaseInfoInvitation } from '../../../../interfaces';
import { PopupsInterface } from '../../../../popups/popups.interface';
import { PopupsRef } from '../../../../popups/popups.ref';
import { DomService, GroupOrderService, LoggerService, TextService } from '../../../../services';
import { PurchaseError } from '../../models/error.model';

@Component({
  selector: 'app-go-invitation-popup',
  templateUrl: './go-invitation-popup.component.html',
  styleUrls: ['./go-invitation-popup.component.scss'],
})
export class GOInvitationPopupComponent implements OnInit {
  public canCancel = true;
  public onClose: any;
  public invitationUrlLink: string;
  public purchaseInfoId: string;
  public invitationsLimit: number;
  public emailsList: string[] = [];
  public invitationEmailsList: string[] = [];
  public invitationMsg = this.textSrv.getText('notifications.default-message.label');
  public isPrivacyPolicyAccepted = false;
  public isLoading = false;

  public readonly maxInvitationMsgLength = 255;

  get isErrorTextarea(): boolean {
    return this.invitationMsg.length > this.maxInvitationMsgLength;
  }

  get canSubmit(): boolean {
    return this.isPrivacyPolicyAccepted && !this.isErrorTextarea && this.invitationEmailsList.length > 0;
  }

  constructor(
    private config: PopupsInterface,
    private popup: PopupsRef,
    private groupOrderSrv: GroupOrderService,
    private loggerSrv: LoggerService,
    public textSrv: TextService,
    public domSrv: DomService
  ) {}

  ngOnInit(): void {
    this.invitationUrlLink = this.config.data.invitationUrlLink;
    this.purchaseInfoId = this.config.data.purchaseInfoId;
    this.invitationsLimit = this.config.data.invitationsLimit;
    this.emailsList = this.config.data.emailsList;
  }

  emailsListChangeHandler(emailsList: string[]): void {
    this.invitationEmailsList = emailsList;
  }

  msgValueOnChange(text: string): void {
    this.invitationMsg = text;
  }

  privacyPolicyCheckboxLinkClick(e: MouseEvent): void {
    e.stopPropagation();
  }

  closePopup(): void {
    this.onClose(true);
  }

  async onSubmit(): Promise<void> {
    if (this.canSubmit && !this.isLoading) {
      const invitation: IPurchaseInfoInvitation = {
        to: this.invitationEmailsList,
        message: this.invitationMsg,
      };

      await this._sendInvitation(invitation);
    }
  }

  private async _sendInvitation(invitation: IPurchaseInfoInvitation): Promise<void> {
    try {
      this.isLoading = true;
      await this.groupOrderSrv.sendInvitation(this.purchaseInfoId, invitation);
      this.closePopup();
    } catch (err) {
      this.loggerSrv.error(
        'purchase_error',
        new PurchaseError({
          name: 'GROUP_ORDER_ERROR',
          message: 'Group Order send invitation error',
          cause: err,
        })
      );
    } finally {
      this.isLoading = false;
    }
  }
}
