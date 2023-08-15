import { Component, Input } from '@angular/core';

export type BreadcrumbItem = {
  isSelected: boolean;
  label: string;
  extraInfo?: string;
  onClick?: () => void;
};

@Component({
  selector: 'breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
})
export class BreadcrumbsComponent {
  @Input() items: BreadcrumbItem[];
}
