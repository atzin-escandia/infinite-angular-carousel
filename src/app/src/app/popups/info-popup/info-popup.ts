import { Component, OnInit } from '@angular/core';

import { PopupsInterface } from '../popups.interface';
import { PopupsRef } from '../popups.ref';
import { DomService, EventService } from '../../services';

const BASE_ID = 'info-popup';

@Component({
  selector: 'info-popup',
  templateUrl: './info-popup.html',
  styleUrls: ['./info-popup.scss'],
})
export class InfoPopupComponent implements OnInit {
  public title: string;
  public description: string;
  public buttonLabel: string;

  public id = BASE_ID;
  public onClose: any;

  constructor(
    public config: PopupsInterface,
    public popup: PopupsRef,
    public domSrv: DomService,
    public eventSrv: EventService
  ) {}

  ngOnInit(): void {
    this.id = BASE_ID;

    if (this.config.data.id) {
      this.id += '-' + this.config.data.id;
    }

    this.title = this.config.data.title;
    this.description = this.config.data.description;
    this.buttonLabel = this.config.data.buttonLabel;
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
