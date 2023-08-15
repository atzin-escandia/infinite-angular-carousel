import { Component, OnInit } from '@angular/core';
import { PopupsInterface } from '../../../../popups/popups.interface';
import { PopupsRef } from '../../../../popups/popups.ref';
import { EventService } from '../../../../services';

@Component({
  selector: 'coloured-popup',
  templateUrl: './coloured-popup.html',
  styleUrls: ['./coloured-popup.scss']
})
export class ColouredPopupComponent implements OnInit {
  public headerColour: string;

  public onClose: any;

  constructor(public config: PopupsInterface, public popup: PopupsRef, public eventSrv: EventService) { }

  ngOnInit(): void {
    this.headerColour = this.config.data.colour;
  }
}
