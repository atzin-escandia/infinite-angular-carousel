import { Component, Input, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { environment } from '../../../../../environments/environment';
import { ImpactMessages } from '../../interfaces/impact-messages.interface';

@Component({
  selector: 'impact-message',
  templateUrl: './impact-message.component.html',
  styleUrls: ['./impact-message.component.scss'],
})
export class ImpactMessageComponent implements OnInit {
  @Input() impactMessage: ImpactMessages;
  @Input() reverse = false;
  link: string;
  isDevMode: boolean;

  constructor(public translocoSrv: TranslocoService){}

  ngOnInit(): void {
    if (this.impactMessage.link) {
      this.link = this.translocoSrv.translate(this.impactMessage.link);
    }
    this.isDevMode = !environment.production;
  }
}
