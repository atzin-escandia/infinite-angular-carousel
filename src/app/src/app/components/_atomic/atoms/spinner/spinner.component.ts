import { Component, Input } from '@angular/core';

@Component({
  selector: 'custom-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
})
export class CustomSpinnerComponent {
  @Input() diameter: number;
}
