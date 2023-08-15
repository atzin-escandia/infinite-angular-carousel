import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICountry, IAddress } from '../../../../interfaces';
import { TextService } from '../../../../services';

@Component({
  selector: 'user-address-card',
  templateUrl: './user-address-card.component.html',
  styleUrls: ['./user-address-card.component.scss'],
})
export class UserAddressCardComponent {
  @Input() address: IAddress;
  @Input() countriesByIso: { [key: string]: ICountry };
  @Input() isOptionSelected: boolean;
  @Input() selectable = false;
  @Input() canEdit = true;

  @Output() optionSelectedChange = new EventEmitter<boolean>();
  @Output() editAddress = new EventEmitter();

  constructor(public textSrv: TextService) {}

  editAddressHandler(): void {
    this.editAddress.emit();
  }

  selectAddressHandler(): void {
    this.optionSelectedChange.emit();
  }
}
