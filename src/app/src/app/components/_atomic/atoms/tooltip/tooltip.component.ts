import { Component, Input } from '@angular/core';

@Component({
  selector: 'custom-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
})
export class CustomTooltipComponent {
  @Input() dialogPosition: 'top' | 'bottom' = 'bottom';
  @Input() borderBottom = true;

  showTooltip = false;

  onMouseover(): void {
    this.showTooltip = true;
  }

  onMouseleave(): void {
    this.showTooltip = false;
  }
}
