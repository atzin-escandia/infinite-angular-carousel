import { Component, Injector, Input, HostListener, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { SealPopupComponent } from '@popups/seal/seal-popup';
import { BaseComponent } from '@components/base/base.component';

@Component({
  selector: 'seal-element',
  templateUrl: './seal-element.component.html',
  styleUrls: ['./seal-element.component.scss']
})
export class SealElementComponent extends BaseComponent implements AfterContentChecked {
  @Input() seal: any;
  @Input() sealIndex: number;
  @Input() sealsEffect = false;

  @HostListener('click') containerClick(): void {
    this.openSealPopup(this.seal);

    return;
  }

  constructor(public injector: Injector, private cdRef: ChangeDetectorRef) {
    super(injector);
  }

  ngAfterContentChecked(): void {
    this.cdRef.detectChanges();
  }

  public openSealPopup(seal: any): void {
    this.popupSrv.open(SealPopupComponent, {
      data: { seal }
    });
  }
}
