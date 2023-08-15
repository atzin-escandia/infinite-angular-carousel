import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {INGO} from '../../interfaces/ngo.interface';

@Component({
  standalone: true,
  selector: 'app-cg-ngo-card',
  templateUrl: './ngo-card.component.html',
  styleUrls: ['./ngo-card.component.scss'],
  imports: [CommonModule]
})
export class CrowdgivingNgoCardComponent {
  @Input() ngo: INGO;
}
