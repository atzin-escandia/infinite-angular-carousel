import { Component, Injector, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { Location } from '@angular/common';
import { FarmersMarketService } from '../../farmers-market.service';
import { Page } from '../../types/page.types';

@Component({
  selector: 'header-projects-list',
  templateUrl: './header-projects-list.component.html',
  styleUrls: ['./header-projects-list.component.scss'],
})
export class HeaderProjectsListComponent {
  customClose: () => void;
  @Input() subtitle: string;
  @Input() title: string;
  @Input() type: Page;
  @Input() showButtons = false;

  constructor(
    public injector: Injector,
    public translocoSrv: TranslocoService,
    public route: ActivatedRoute,
    public location: Location,
    public router: Router,
    public farmersMarketSrv: FarmersMarketService
  ) {}
}
