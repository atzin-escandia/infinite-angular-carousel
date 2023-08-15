import { Component } from '@angular/core';
import { PopupsInterface } from '../../../../popups/popups.interface';
import { PopupsRef } from '../../../../popups/popups.ref';
import { DomService, TextService } from '../../../../services';

@Component({
  selector: 'app-go-info-popup',
  templateUrl: './go-info-popup.component.html',
  styleUrls: ['./go-info-popup.component.scss'],
})
export class GOInfoPopupComponent {
  public canCancel = true;
  public onClose: any;

  constructor(private config: PopupsInterface, private popup: PopupsRef, public textSrv: TextService, public domSrv: DomService) {}
}
