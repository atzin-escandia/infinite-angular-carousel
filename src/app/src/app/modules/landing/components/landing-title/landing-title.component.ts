import {Component, Input} from '@angular/core';

@Component({
  selector: 'landing-title',
  templateUrl: './landing-title.component.html',
  styleUrls: ['./landing-title.component.scss'],
})
export class LandingTitleComponent {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() body?: string;
  @Input() innerBlock = false;
}
