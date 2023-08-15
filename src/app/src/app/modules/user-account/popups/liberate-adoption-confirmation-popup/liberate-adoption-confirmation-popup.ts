import { Component } from '@angular/core';

import { PopupsInterface } from '../../../../popups/popups.interface';
import { PopupsRef } from '../../../../popups/popups.ref';

import { DomService, TextService, UpService } from '../../../../services';

@Component({
  selector: 'liberate-adoption-confirmation-popup',
  templateUrl: './liberate-adoption-confirmation-popup.html',
  styleUrls: ['./liberate-adoption-confirmation-popup.scss']
})
export class LiberateAdoptionConfirmationPopupComponent {

  public onClose: any;
  public id: string;

  constructor(
    public config: PopupsInterface,
    public popup: PopupsRef,
    public textSrv: TextService,
    public domSrv: DomService,
    public upSrv: UpService
  ) { }

  async confirmAdoptionLiberation(): Promise<any> {

    try {
      await this.upSrv.liberate(this.config.data.id);
      this.onClose(true);
    }

    catch (err) {
      this.onClose(false);
    }
  }
}
