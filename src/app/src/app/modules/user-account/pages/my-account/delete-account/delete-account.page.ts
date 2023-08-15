import { Component, OnInit, Injector } from '@angular/core';
import { Location } from '@angular/common';
import { EmailSentPopupComponent } from '../../../popups/email-sent-popup';
import { BasePage } from '@app/pages';
import { UserService } from '@app/services';
import { BreadcrumbItem } from '@components/breadcumbs/breadcrumbs.component';
import { StateService } from '@services/state/state.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'delete-account-page',
  templateUrl: './delete-account.page.html',
  styleUrls: ['./delete-account.page.scss'],
})
export class DeleteAccountPageComponent extends BasePage implements OnInit {
  public crowdfamer: any;
  public canDeleteAccount = false;
  public hasBeenSentMail = false;
  public breadcrumbs: BreadcrumbItem[] = [];
  public isLoading = false;
  public error: any;
  public translationKeys = [
    'page.delete-account-receive-email-step.body',
    'page.delete-account-lose-adoptions-step.body',
    'page.delete-account-lose-unused-credit-step.body',
  ];

  constructor(public injector: Injector, private location: Location, private userSrv: UserService, private stateSrv: StateService) {
    super(injector);
  }

  ngOnInit(): void {
    void this.checkData();

    this.breadcrumbs = [
      {
        isSelected: false,
        label: 'page.profile.button',
        onClick: () => this.goPreviousPage(),
      },
      {
        isSelected: false,
        label: this.textSrv.getText('Personal info'),
        onClick: () => this.goPreviousPage(),
      },
      {
        isSelected: true,
        label: 'global.delete-account.text-info',
      },
    ];
  }

  public async handleClickDeleteAccount(): Promise<void> {
    try {
      this.isLoading = true;
      await this.userService.sendMailToDeleteAccount(this.crowdfamer._user);
    } catch (error) {
      console.error(error);
      this.showErrorPopup();
      this.error = error;
    } finally {
      this.isLoading = false;

      if (!this.error) {
        this.hasBeenSentMail = true;

        this.popupSrv.open(EmailSentPopupComponent, {
          data: {
            email: this.crowdfamer.email,
            onClose: () => {
              this.redirectMyAccountPage();
            },
          },
        });
      }
    }
  }

  private async checkData(): Promise<void> {
    try {
      this.isLoading = true;
      const crowdfarmer = await this.userSrv.get();
      const { canDeleteAccount } = await this.userSrv.checkAccountDeletion(crowdfarmer.email);

      this.crowdfamer = crowdfarmer;
      this.canDeleteAccount = canDeleteAccount;
      await this.checkCredits();
    } catch (error) {
      console.error(error);
      this.showErrorPopup();
      this.error = error;
    } finally {
      this.setLoading(false);
      this.setInnerLoader(false, false);
      this.isLoading = false;
      !this.canDeleteAccount && this.routerSrv.navigate('private-zone/my-account/info');
    }
  }

  private redirectMyAccountPage(): void {
    this.routerSrv.navigate('private-zone/my-account/info');
  }

  private goPreviousPage(): void {
    this.location.back();
  }

  private async checkCredits(): Promise<void> {
    const isCreditsAvailable = await this.stateSrv
      .isCreditsAvailable()
      .pipe(first((res) => typeof res === 'boolean'))
      .toPromise();

    if (isCreditsAvailable) {
      const currentCountry = this.countrySrv.getCurrentCountry();
      const { credits } = await this.userService.getCredits(currentCountry?.currency);

      !credits && this.translationKeys.pop();
    } else {
      this.translationKeys.pop();
    }
  }
}
