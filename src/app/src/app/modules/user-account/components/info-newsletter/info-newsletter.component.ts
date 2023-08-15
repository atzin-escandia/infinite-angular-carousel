import { Component, Input, Injector, Output, EventEmitter, OnInit } from '@angular/core';
import { RouterService } from '@app/services';
import { BaseComponent } from '@app/components';

@Component({
  selector: 'info-newsletter',
  templateUrl: './info-newsletter.component.html',
  styleUrls: ['./info-newsletter.component.scss']
})
export class InfoNewsletterComponent extends BaseComponent implements OnInit {
  @Input() public categories: any;
  @Input() public user: any;
  @Output() public returnUserCategories = new EventEmitter<any>();
  @Output() public returnUserSubscription = new EventEmitter<any>();

  public selectedCats: any = {};
  public clonedUser: any = {};

  constructor(public injector: Injector, public routerSrv: RouterService) {
    super(injector);
  }

  ngOnInit(): void {
    this.setAllCategories(false);
    this.clonedUser = Object.assign({}, this.user);
  }

  private setAllCategories(subscribe: boolean): void {
    for (const cat of this.categories) {
      this.selectedCats[cat._id] = subscribe ? true : this.user.newsletterCats.includes(cat._id);
    }
  }

  public updateCategories(): void {
   const newsletterCats = [];

    for (const cat in this.selectedCats) {
      if (this.selectedCats[cat]) {
        newsletterCats.push(cat);
      }
    }
    this.user.newsletterCats = newsletterCats;
    this.returnUserCategories.emit({ user: this.user, categories: {categories: newsletterCats} });
  }

  public subscribeNewsletter(): void {
    for (const cat of this.categories) {
      this.selectedCats[cat._id] = !this.clonedUser.newsletterPermissionGiven;
    }
  }

  public getLangInfo(e: string): void {
    this.user.notificationLanguage = e;
  }

  public async autoLoginValidation(funcName: string, args?: any[]): Promise<void> {
    const callBack = (): void => {
      if (args) {
        this[funcName](...args);
      } else {
        this[funcName]();
      }
    };

    await this.compCheckLogin(this.user.email, callBack);
  }
}
