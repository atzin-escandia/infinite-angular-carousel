import { Component, Injector, Output, EventEmitter, Input } from '@angular/core';
import { UpService, LoaderService, EventService } from '@app/services';
import { BaseComponent } from '@components/base';

@Component({
  selector: 'edit-certificate',
  templateUrl: './edit-certificate.component.html',
  styleUrls: ['./edit-certificate.component.scss']
})
export class EditCertificateComponent extends BaseComponent {

  @Output() goToMyUpEvt: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() sendCertData: EventEmitter<any> = new EventEmitter<any>();

  @Input() public documentationSectionElement: any;
  @Input() public upCf: any;

  public name = '';
  public surname = '';
  public editCertOnDisplay: boolean;
  public disabledBtn = true;
  public certData: any;

  constructor(
    public injector: Injector,
    public upSrv: UpService,
    public loaderSrv: LoaderService,
    public eventSrv: EventService,
  ) {
    super(injector);
  }

  /**
   * Cancel the adoption certificate edition
   */
  public goToMyUp(): void {
    this.goToMyUpEvt.emit(this.editCertOnDisplay = false);
  }

  /**
   * Save changes on adoption certificate
   */
  async saveCertChanges(): Promise<void> {
    this.eventSrv.dispatchEvent('loading-animation', {set: true});
    this.certData = await this.upSrv.editUpCfCert(this.upCf._id, this.name, this.surname);
    this.eventSrv.dispatchEvent('loading-animation', {set: false});
    this.sendCertData.emit(this.certData);
    this.goToMyUp();
  }
}
