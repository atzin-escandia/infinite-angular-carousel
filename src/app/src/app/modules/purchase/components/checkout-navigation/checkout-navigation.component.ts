import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICountry } from '../../../../interfaces';
import { CountryService, TextService } from '../../../../services';
import { ICheckoutSection } from '../../interfaces/checkout.interface';

@Component({
  selector: 'checkout-navigation',
  templateUrl: './checkout-navigation.component.html',
  styleUrls: ['./checkout-navigation.component.scss'],
})
export class CheckoutNavigationComponent {
  @Input() sections: ICheckoutSection[] = [];
  @Input() set activeSection(activeSection: ICheckoutSection) {
    if (activeSection) {
      this._activeSection = activeSection;
      this.activeSectionIdx = this.sections.findIndex((elem) => elem.path === activeSection.path);
      this.isCartSection = activeSection.path === 'cart';
    }
  }

  get activeSection(): ICheckoutSection {
    return this._activeSection;
  }

  get country(): string {
    return this.countrySrv.getCountry();
  }

  @Input() countriesByIso: { [key: string]: ICountry } = {};

  @Output() openLocation = new EventEmitter();

  _activeSection: ICheckoutSection;
  activeSectionIdx: number;
  isCartSection: boolean;

  constructor(public textSrv: TextService, public countrySrv: CountryService) {}

  public buildIconClass(icon: string): string {
    return `eva ${icon} t-h4-regular`;
  }

  public isActiveSection(idx: number): boolean {
    return idx === this.activeSectionIdx;
  }

  public isForwardSection(idx: number): boolean {
    return idx > this.activeSectionIdx;
  }

  public onCountryClick(): void {
    this.openLocation.emit();
  }
}
