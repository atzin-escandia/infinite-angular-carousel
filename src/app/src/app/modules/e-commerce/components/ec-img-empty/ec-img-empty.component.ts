import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SharedModule } from '@app/modules/shared/shared.module';

@Component({
  selector: 'ec-img-empty',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './ec-img-empty.component.html',
  styleUrls: ['./ec-img-empty.component.scss'],
})
export class EcImgEmptyComponent {
  @Input() icon = 'image';
}
