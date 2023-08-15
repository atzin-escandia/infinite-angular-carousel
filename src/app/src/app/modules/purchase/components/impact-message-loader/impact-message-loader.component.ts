import { Component, Input } from '@angular/core';
import { ImpactMessages } from '../../interfaces/impact-messages.interface';

@Component({
  selector: 'impact-message-loader',
  templateUrl: './impact-message-loader.component.html',
  styleUrls: ['./impact-message-loader.component.scss'],
})
export class ImpactMessageLoaderComponent {
  @Input() impactMessage: ImpactMessages;
}
