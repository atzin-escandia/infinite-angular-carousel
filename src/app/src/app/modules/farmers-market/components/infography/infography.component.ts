import { Component, Input } from '@angular/core';
import { CardService } from '../../services/card.service';

@Component({
  selector: 'infography',
  templateUrl: './infography.component.html',
  styleUrls: ['./infography.component.scss'],
})
export class InfographyComponent {
  @Input() lang: string;
  constructor(public cardSrv: CardService) {}

}
