import {Component, Input} from '@angular/core';
import {PopupsInterface} from '../popups.interface';
import {PopupsRef} from '../popups.ref';
import {EventService, TextService} from '../../services';

@Component({
  selector: 'crossselling-info',
  templateUrl: './crossselling-info.html',
  styleUrls: ['./crossselling-info.scss']
})
export class CrosssellingInfoComponent {
  public onClose: any;
  public startTab = 0;
  public optionsFilter = [this.textSrv.getText('theProject'), this.textSrv.getText('whatReceive')];

  constructor(public config: PopupsInterface, public popup: PopupsRef, public eventSrv: EventService, public textSrv: TextService) { }

  onAccept(): void {
    // Let other component know that popup closes
    this.eventSrv.dispatchEvent('crossselling-info', false);

    this.onClose(null, () => {
      if (this.config.data.onClose) {
        this.config.data.onClose();
      }
    });
  }

  public tabFilter(tabItem: number): void {
    this.startTab = tabItem;
  }
}
