import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-checkout-summary-price',
  templateUrl: './checkout-summary-price.component.html',
})
export class CheckoutSummaryPriceComponent {
  @Input() price = 0;
  @Input() finalPrice = 0;
  @Input() credits = 0;
  @Input() creditsToSpend = 0;
  @Input() showCreditsTooltip = false;
  @Input() isGroupOrder: boolean;

  get availableCredits(): number {
    if (this.price === this.creditsToSpend && this.credits > this.creditsToSpend) {
      return this.credits;
    }

    return this.creditsToSpend;
  }
}
