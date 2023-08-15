import {Component, OnInit, Injector, OnDestroy} from '@angular/core';
import {BasePage} from '../base';
import {UpService, AuthService} from '../../services';
import {Subscription} from 'rxjs';
import {StatusPopupComponent} from '../../popups/status-popup';
@Component({
  selector: 'green-page',
  templateUrl: './green-page.page.html',
  styleUrls: ['./green-page.page.scss']
})
export class GreenPageComponent extends BasePage implements OnInit, OnDestroy {
  public categories: any;
  public settings: any = {};
  public newsletter = false;
  public cancelledAccount = false;
  public updatedUser = false;
  private token: string;
  private isMktCloud = false;
  public paramSubscrip: Subscription;

  constructor(public injector: Injector, private upSrv: UpService, public authSrv: AuthService) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    this.domSrv.showHeader(false);
    this.domSrv.showFooter(false);
    this.paramSubscrip = this.route.params.subscribe(params => {
      if (params.action === 'newsletter') {
        this.newsletter = true;
        this.token = params.token;
        this.isMktCloud = params.platform === 'mkt-cloud';
      } else if (params.action === 'delete') {
        this.cancelledAccount = true;
        this.token = params.token;
      }
    });

    if (!this.cancelledAccount) {
      const preferences = await this.userService.getNewsletterPreferences(this.token, this.isMktCloud);

      for (const id of preferences.newsletterCats) {
        this.settings[id] = true;
      }

      this.categories = await this.upSrv.getCategories();
    }

    setTimeout(() => {
      this.setLoading(false);
      this.setInnerLoader(false, false);
    }, 200);
  }

  ngOnDestroy(): void {
    this.domSrv.showHeader();
    this.domSrv.showFooter();
    if (this.paramSubscrip) {
      this.paramSubscrip.unsubscribe();
    }
  }

  async updateIntereses(settings: any): Promise<void> {
    try {
      const newsletterCats = [];

      for (const cat in settings) {
        if (settings[cat]) {
          newsletterCats.push(cat);
        }
      }

      const updatedUser = await this.userService.updateNewsletterPreferences(
        this.token,
        {newsletterCats},
        this.isMktCloud
      );

      if (updatedUser) {
        this.updatedUser = true;
      }
    } catch (error) {
      this.popupSrv.open(StatusPopupComponent, {
        data: {
          err: error,
          msgSuccess: 'error on the action'
        }
      });
    }
  }

  public backToInterests(e: boolean): void {
    this.updatedUser = e;
  }
}
