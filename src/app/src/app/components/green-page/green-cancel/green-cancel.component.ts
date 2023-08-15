import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BaseComponent } from '@components/base';
import { AuthService, LoaderService, RouterService, TextService, UserService } from '@app/services';
import { SurveyResponseService } from '@modules/user-account/services/survey-response';
import { SurveyOptionsService } from '@modules/user-account/services/survey-options';
import { SurveyName, SurveyOption } from '@modules/user-account/interfaces/survey.interface';
import { StatusPopupComponent } from '@popups/status-popup';

const OTHER_RESPONSE_ID = 'other';

@Component({
  selector: 'green-cancel',
  templateUrl: './green-cancel.component.html',
  styleUrls: ['./green-cancel.component.scss'],
})
export class GreenCancelComponent extends BaseComponent implements OnInit {
  public errorDeleteAccount = false;
  public shouldShowTextarea = false;
  public isDisabledButton = true;
  public radios: SurveyOption[] = [];
  public radioConfig: {
    click: string;
  };
  private textAreaValue = '';
  private radioSelected: string;

  constructor(
    public injector: Injector,
    public route: ActivatedRoute,
    public routerSrv: RouterService,
    public textSrv: TextService,
    public surveyOptionsSrv: SurveyOptionsService,
    public surveyResponseSrv: SurveyResponseService,
    public userSrv: UserService,
    public authSrv: AuthService,
    public loaderSrv: LoaderService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.loaderSrv.setLoading(false);

    this.radioConfig = {
      click: 'handleClickRadio',
    };

    this.route.params.subscribe(async (params) => {
      try {
        this.loaderSrv.setLoading(true);
        if (params.action === 'delete' && params.token) {
          const radios = await this.getRadios();

          this.radios = radios.sort((a, b) => a.order - b.order);
          await this.userSrv.deleteUser(params.token);
        }
      } catch (error) {
        console.error(error);
        this.errorDeleteAccount = true;
        this.showErrorPopup();
      } finally {
        this.loaderSrv.setLoading(false);
      }
    });
  }

  public handleClickRadio(selectedOption: number): void {
    this.radioSelected = this.radios[selectedOption].responseID;
    const isCheckedOtherRadio = this.radioSelected === OTHER_RESPONSE_ID;

    this.shouldShowTextarea = isCheckedOtherRadio;
    this.isDisabledButton = this.radioSelected === undefined || isCheckedOtherRadio;
  }

  public handleKeyUpTextarea(value: string): void {
    this.textAreaValue = value;
    this.isDisabledButton = !value && this.radioSelected === OTHER_RESPONSE_ID;
  }

  public async handleClickSendSurvey(): Promise<void> {
    const surveyName: SurveyName = 'deletedAccountFeedbackSurvey';
    const canSaveSurvey = (this.radioSelected === OTHER_RESPONSE_ID && this.textAreaValue.length) || this.radioSelected !== undefined;

    if (canSaveSurvey) {
      try {
        this.isDisabledButton = true;
        await this.surveyResponseSrv.saveSurvey(this.radioSelected, null, this.textAreaValue, surveyName);
        this.authSrv.logout();
        this.routerSrv.navigate('');
      } catch (error) {
        console.error(error);
      }
    }
  }

  private async getRadios(): Promise<SurveyOption[]> {
    const options = await this.surveyOptionsSrv.getSurveyOptions('deletedAccountFeedbackSurvey');

    return options;
  }

  private showErrorPopup(): void {
    this.popupSrv.open(StatusPopupComponent, {
      data: {
        err: true,
      },
    });
  }
}
