import {Component, OnInit} from '@angular/core';
import {PopupsInterface} from '../popups.interface';
import {PopupsRef} from '../popups.ref';
import {EventService, TextService} from '../../services';

@Component({
  selector: 'generic-popup',
  templateUrl: './generic-popup.html',
  styleUrls: ['./generic-popup.scss']
})
export class GenericPopupComponent implements OnInit {
  public onClose: any;
  public id: string;
  public genericPopupSyle = 1;

  constructor(public config: PopupsInterface, public popup: PopupsRef, public eventSrv: EventService, public textSrv: TextService) { }

  ngOnInit(): void {
    this.id = 'generic-popup';
    if (this.config.data.id) {
      this.id += '-' + this.config.data.id;
    }
    if (this.config.data.style) {
      this.genericPopupSyle = this.config.data.style;
    }
  }

  onAccept(): void {
    // Let other component know that popup closes
    this.eventSrv.dispatchEvent('generic-popup', false);

    this.onClose(null, () => {
      if (this.config.data.onClose) {
        this.config.data.onClose();
      }
    });
  }
}
