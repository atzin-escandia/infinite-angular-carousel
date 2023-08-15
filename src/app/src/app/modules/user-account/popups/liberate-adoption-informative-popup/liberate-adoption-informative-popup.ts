import { Component } from '@angular/core';

import { PopupsInterface } from '../../../../popups/popups.interface';
import { PopupsRef } from '../../../../popups/popups.ref';
import { DomService, TextService } from '../../../../services';

@Component({
  selector: 'liberate-adoption-informative-popup',
  templateUrl: './liberate-adoption-informative-popup.html',
  styleUrls: ['./liberate-adoption-informative-popup.scss']
})
export class LiberateAdoptionInformativePopupComponent {
  constructor(public config: PopupsInterface, public popup: PopupsRef, public textSrv: TextService, public domSrv: DomService) { }
}
