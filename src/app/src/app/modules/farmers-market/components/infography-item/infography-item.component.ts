import { Component, Input } from '@angular/core';

@Component({
  selector: 'infography-item',
  templateUrl: './infography-item.component.html',
  styleUrls: ['./infography-item.component.scss'],
})
export class InfographyItemComponent {
  @Input() title: string;
  @Input() description: string;
  @Input() img: string;
  @Input() errorImg: string;

  showErrorImg(): void {
    this.img = this.errorImg;
  }
}
