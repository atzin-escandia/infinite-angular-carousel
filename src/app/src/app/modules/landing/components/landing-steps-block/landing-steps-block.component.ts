import { Component, Input } from '@angular/core';
import { StepCard } from './landing-step-block.interface';

@Component({
  selector: 'landing-steps-block',
  templateUrl: './landing-steps-block.component.html',
  styleUrls: ['./landing-steps-block.component.scss'],
})
export class LandingStepsBlockComponent {
  @Input() cards: StepCard[] = [];
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() hasEnumeration = false;
}
