import { Component, Input } from '@angular/core';
import { HeaderSeal } from '../../../../interfaces';

@Component({
  selector: 'header-seals',
  templateUrl: './header-seals.component.html',
  styleUrls: ['./header-seals.component.scss'],
})
export class HeaderSealsComponent {
  @Input() seals: HeaderSeal[] = [];
}
