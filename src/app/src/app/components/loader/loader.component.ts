import {Component, OnInit} from '@angular/core';
import {ImpactMessages} from '@modules/purchase/interfaces/impact-messages.interface';
import {DomService, StorageService} from '@app/services';

@Component({
  selector: 'loader-component',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {
  public active = false;
  public isPage = false;
  public impactMessage: ImpactMessages;
  public event: any;

  constructor(private domSrv: DomService, public storageSrv: StorageService) { }

  ngOnInit(): void {
    this.domSrv.addListener('window', 'loading-animation', (event: any) => {
      this.set(event.detail.set, event.detail.isPage);
    });
  }

  /**
   * Set if loader should be visible.
   */
  public set(value: boolean, page?: boolean): void {
    this.checkIsImpactMessage();

    if (page !== undefined) {
      if (page === true) {
        this.isPage = page;
        this.active = value;
      } else {
        this.isPage = page;
        this.active = value;
      }
    } else {
      if (!this.isPage) {
        this.active = value;
      }
    }
  }

  checkIsImpactMessage(): void {
    this.impactMessage = this.storageSrv.get('impactMessage');
  }
}
