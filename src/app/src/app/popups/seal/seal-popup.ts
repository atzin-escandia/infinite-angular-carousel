import {Component, OnInit} from '@angular/core';
import {PopupsInterface} from '../popups.interface';
import {PopupsRef} from '../popups.ref';

import {environment} from '../../../environments/environment';
import {TextService, DomService} from '../../services';

@Component({
  selector: 'seal-popup',
  templateUrl: './seal-popup.html',
  styleUrls: ['./seal-popup.scss']
})
export class SealPopupComponent implements OnInit {
  public env = environment;
  public seal: any;

  constructor(
    public config: PopupsInterface, public popup: PopupsRef,
    public textSrv: TextService, public domSrv: DomService
  ) { }

  ngOnInit(): void {
    this.seal = this.config.data.seal;
  }

  public openFile(file: any): void {
    // TODO: Universal fix needed
    if (this.domSrv.isPlatformBrowser()) {
      window.open(file.url);
    }
  }
}
