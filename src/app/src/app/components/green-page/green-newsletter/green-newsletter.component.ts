import { Component, Injector, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { RouterService } from '@app/services';
import { BaseComponent } from '@components/base';

@Component({
  selector: 'green-newsletter',
  templateUrl: './green-newsletter.component.html',
  styleUrls: ['./green-newsletter.component.scss'],
})
export class GreenNewsletterComponent extends BaseComponent implements OnInit {
  @Input() public categories: any;
  @Input() public settings: any;
  @Input() public updatedUser: any;
  @Output() public returnUser = new EventEmitter<any>();
  @Output() public backToInterests = new EventEmitter<boolean>();

  public unsuscribeAllActive = false;

  constructor(public injector: Injector, public routerSrv: RouterService) {
    super(injector);
  }

  ngOnInit(): void {
    this.checkUnsuscribeAllActive();
  }

  public selectCategory(): void {
    this.checkUnsuscribeAllActive();
  }

  checkUnsuscribeAllActive(): void {
    for (const category in this.settings) {
      if (this.settings[category]) {
        this.unsuscribeAllActive = true;

        return;
      }
    }
    this.unsuscribeAllActive = false;
  }

  suscribeAll(): void {
    for (const category in this.settings) {
      if (this.settings[category] !== undefined) {
        this.settings[category] = true;
      }
    }
    this.unsuscribeAllActive = true;
  }

  unsuscribeAll(): void {
    for (const category in this.settings) {
      if (this.settings[category] !== undefined) {
        this.settings[category] = false;
      }
    }
    this.unsuscribeAllActive = false;
  }

  public updateCategories(): void {
    this.returnUser.emit(this.settings);
  }

  public goBackToInterests(): void {
    this.backToInterests.emit(false);
  }
}
