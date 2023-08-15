import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

import { TextService } from '@services/text/text.service';
import { DomService } from '@services/dom/dom.service';
import { SurveyResponseService } from '../../services/survey-response/survey-response.service';
import { SurveyOptionsService } from '../../services/survey-options/survey-option.service';
import { RouterService } from '@services/router/router.service';
import { SurveyName, SurveyOption } from '../../interfaces/survey.interface';

import { ApiResource } from '@resources/api/api.resource';
import { LoggerService } from '@services/logger';
import { LiberationSurveyOptions } from '../../constants/survey-liberation.constants';

@Component({
  selector: 'liberate-adoption-survey',
  templateUrl: './liberate-adoption-survey.html',
  styleUrls: ['./liberate-adoption-survey.scss'],
  encapsulation: ViewEncapsulation.None
})

export class LiberateAdoptionSurveyComponent implements OnInit {

  @Input() public upCf: any;

  public showTextArea = false;
  public error = false;
  public textInputMessage = '';
  public liberationSurveyOptions = LiberationSurveyOptions;

  private surveyName: SurveyName = 'liberateAdoptionSurvey';
  private radioSelected: string;
  public radios: SurveyOption[] = [];

  public radioConfig = {
    click: 'selectOption',
    checked: false
  };

  constructor(
    public textSrv: TextService,
    public domSrv: DomService,
    public apiRsc: ApiResource,
    public surveyResponseSrv: SurveyResponseService,
    public surveyOptionsSrv: SurveyOptionsService,
    public routerSrv: RouterService,
    private loggerSrv: LoggerService
  ) {

  }
  async ngOnInit(): Promise<void> {
    try {
      const result = await this.surveyOptionsSrv.getSurveyOptions(this.surveyName);

      this.radios = result.sort((a, b) => a.order - b.order);
    } catch (error) {
      // Just catch
      this.loggerSrv.error(this.surveyName + ' error on CAPI request', {surveyName: this.surveyName});
    }
  }

  public selectOption(selectedOption: number): void {
    this.radioSelected = this.radios[selectedOption].responseID;
    this.radioConfig.checked = true;
    this.showTextArea = this.radioSelected === this.liberationSurveyOptions.OTHER;
  }

  /**
   * Check if textarea is empty
   */
  public messageIsEmpty(message: any): any {
    const emptySpace = /^[^.\s]/;

    this.error = !message.match(emptySpace);

    return this.error;
  }

  /**
   * Sumbmit survey
   */
  async register(): Promise<any> {
    const emptyMessage = this.messageIsEmpty(this.textInputMessage);
    const surveyName: SurveyName = 'liberateAdoptionSurvey';
    const _upCf = this.upCf;

    if ((this.radioSelected === this.liberationSurveyOptions.OTHER && !emptyMessage) ||
      (this.radioSelected !== this.liberationSurveyOptions.OTHER)) {
      await this.surveyResponseSrv.saveSurvey(this.radioSelected, _upCf, this.textInputMessage, surveyName);
      this.routerSrv.navigate('private-zone/my-garden');
    }
  }
}
