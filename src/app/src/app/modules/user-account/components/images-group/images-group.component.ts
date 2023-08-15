import {Component, Input} from '@angular/core';
import {IMAGE_SIZE} from '../../../../constants/order.constants';
@Component({
  selector: 'images-group',
  templateUrl: './images-group.component.html',
  styleUrls: ['./images-group.component.scss'],
})
export class ImagesGroupComponent {
  @Input() images: string[] = [];
  @Input() size = IMAGE_SIZE.MEDIUM;
}
