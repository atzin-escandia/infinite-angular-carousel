import { Component, OnInit } from '@angular/core';
import { PopupsInterface } from '../../../../popups/popups.interface';
import { PopupsRef } from '../../../../popups/popups.ref';
import { EventService } from '../../../../services';

const BASE_ID = 'email-sent-popup';

@Component({
  selector: 'email-sent-popup',
  templateUrl: './email-sent-popup.component.html',
  styleUrls: ['./email-sent-popup.component.scss'],
})
export class EmailSentPopupComponent implements OnInit {
  public email = '';
  public onClose: any;

  constructor(public config: PopupsInterface, public popup: PopupsRef, public eventSrv: EventService) {}

  ngOnInit(): void {
    this.email = this.config.data.email;
  }

  handleClickCloseButton(): void {
    // Let other component know that popup closes
    this.eventSrv.dispatchEvent(BASE_ID, false);

    this.onClose(null, () => {
      if (this.config.data.onClose) {
        this.config.data.onClose();
      }
    });
  }
}
