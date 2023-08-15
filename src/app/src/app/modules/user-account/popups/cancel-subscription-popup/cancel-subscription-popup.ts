import {Component} from '@angular/core';
import {DomService, EventService, LoaderService, SubscriptionService, UtilsService} from '../../../../services';
import {PopupsInterface} from '../../../../popups/popups.interface';
import {PopupsRef} from '../../../../popups/popups.ref';

const BASE_ID = 'cancel-subscription-popup';

@Component({
  selector: 'cancel-subscription-popup',
  templateUrl: './cancel-subscription-popup.html',
  styleUrls: ['./cancel-subscription-popup.scss'],
})
export class CancelSubscriptionPopupComponent {
  public onClose?: any;

  constructor(
    public config: PopupsInterface,
    public popup: PopupsRef,
    public domSrv: DomService,
    public eventSrv: EventService,
    public loaderSrv: LoaderService,
    public utilsSrv: UtilsService,
    public subscriptionSrv: SubscriptionService
  ) {}


  public async cancelSubscription(): Promise<any> {
    try {
      this.onClose(true);
      this.loaderSrv.setLoading(true);
      await this.subscriptionSrv.cancelSubscription(this.config.data.id);
      this.loaderSrv.setLoading(false);
    }
    catch (error) {
      this.onClose(false);
    }

  }

  closePopup(): void {
    this.eventSrv.dispatchEvent(BASE_ID, false);

    this.onClose(null, () => {
      this.config.data.onClose?.();
    });
  }
}

