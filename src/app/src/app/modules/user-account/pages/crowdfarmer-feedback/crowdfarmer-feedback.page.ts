import { Component, OnInit, Injector, ViewEncapsulation } from '@angular/core';
import { BasePage } from '../../../../pages';
import { TranslocoService } from '@ngneat/transloco';
import { CrowdfarmerFeedbackService } from '../../../../services/crowdfarmerFeedback';
import { FormControl, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ORDER_FEEDBACK_KEYS, ORDER_FEEDBACK_MAP, ORDER_FEEDBACK_SURVEY_NAME_MAP } from '../../utils/maps/crowdfarmer-feedback.map';
import { environment } from '../../../../../environments/environment';
import { SeoService } from '../../../../services';

@Component({
  selector: 'crowdfarmer-feedback',
  templateUrl: './crowdfarmer-feedback.page.html',
  styleUrls: ['./crowdfarmer-feedback.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CrowdfarmerFeedbackPageComponent extends BasePage implements OnInit {
  activeForm: any;
  surveyTitle = this.translocoSrv.translate('page.experience.title');
  stepActive = 1;
  feedbackForm: FormGroup;
  orderFeedbackKey = ORDER_FEEDBACK_KEYS;
  rating: ORDER_FEEDBACK_KEYS;
  maxCharacter = 250;
  stepLimit = 3;
  buttonText: string;
  textAreaPlaceholder = this.translocoSrv.translate('page.leave-comments.form') + ' ' + this.translocoSrv.translate('global.optional.form');
  descriptionForm = this.translocoSrv.translate('page.tell-us.body');
  pageTrigger: string;
  finalScreen = false;
  finalInfo = {
    image: null,
    text: null,
    title: null,
  };

  validationError = false;
  isSendingInfo = false;

  constructor(
    public injector: Injector,
    public translocoSrv: TranslocoService,
    private crowdfarmerFeedbackSrv: CrowdfarmerFeedbackService,
    public router: Router,
    public seoSrv: SeoService
  ) {
    super(injector);
    this.pageTrigger = this.router.getCurrentNavigation() && this.router.getCurrentNavigation().previousNavigation?.finalUrl.toString();
  }

  ngOnInit(): void {
    this.setInnerLoader(false, true);
    this.feedbackForm = new FormGroup({});
    this.feedbackForm.addControl('orderRatingComments', new FormControl());
    this.setSeoData();
  }

  private setSeoData(): void {
    const seoData = {
      title: this.translocoSrv.translate('page.feedback.tab'),
    };

    this.seoSrv.set(this.router.url, seoData);
  }

  setRating(rating: ORDER_FEEDBACK_KEYS): void {
    this.rating = rating;
    ++this.stepActive;
    this.setActiveForm();
  }

  goBack(): void {
    if (this.stepActive > 1) {
      --this.stepActive;
    } else {
      this.setTargetRoute();
    }

    this.validationError = false;

    this.setActiveForm();
  }

  async nextStep(): Promise<void> {
    if (this.stepLimit === this.stepActive) {
      await this.sendInfo();
    }

    if (this.stepActive === 2 && this.checkIfFormValid()) {
      ++this.stepActive;
    }

    this.setActiveForm();
  }

  setButtonRouteText(): string {
    const buttonText = this.pageTrigger?.includes('info')
      ? this.translocoSrv.translate('page.go-to-detail.button')
      : this.translocoSrv.translate('page.go-to-orders.button');

    return buttonText;
  }

  setActiveForm(): void {
    if (this.stepActive === 1) {
      this.feedbackForm = new FormGroup({});
      this.feedbackForm.addControl('orderRatingComments', new FormControl());
      this.buttonText = '';
      this.surveyTitle = this.translocoSrv.translate('page.experience.title');
    }

    if (this.stepActive === 2) {
      this.crowdfarmerFeedbackSrv
        .getFormContent(this.rating)
        .pipe(first((val) => !!val))
        .subscribe((formData) => {
          this.activeForm = formData;
          for (const field of this.activeForm) {
            this.feedbackForm.addControl(field.responseID, new FormControl(false));
            this.surveyTitle = this.translocoSrv.translate(ORDER_FEEDBACK_SURVEY_NAME_MAP.get(field.surveyName));
          }
        });

      this.buttonText = this.translocoSrv.translate('global.continue.text-link');
    }

    if (this.stepActive === this.stepLimit) {
      this.buttonText = this.translocoSrv.translate('global.finish.button');
      this.surveyTitle = this.translocoSrv.translate('page.give-details.title');
    }

    this.descriptionForm = this.stepActive !== 1 ? '' : this.translocoSrv.translate('page.tell-us.body');
  }

  setTextAreaInfo(event: any): void {
    this.feedbackForm.controls.orderRatingComments.setValue(event.target.value);
  }

  checkedChange(event: boolean, name: string): void {
    this.feedbackForm.controls[name].setValue(event);

    for (const field of Object.keys(this.feedbackForm.getRawValue())) {
      if (this.feedbackForm.getRawValue()[field]) {
        this.validationError = false;

        return;
      }
    }

    this.validationError = true;
  }

  checkIfFormValid(): boolean {
    for (const key in this.feedbackForm.value) {
      if (this.feedbackForm.value[key]) {
        this.validationError = false;

        return true;
      }
    }
    this.validationError = true;

    return false;
  }

  async sendInfo(): Promise<void> {
    const rateValue = this.rating === ORDER_FEEDBACK_KEYS.DONTLIKE || this.rating === ORDER_FEEDBACK_KEYS.AVERAGE ? -1 : 1;
    const dataFormValue = this.feedbackForm.getRawValue();

    const feedbackObject: any = {
      _order: this.route.snapshot.params.orderId,
      orderRating: ORDER_FEEDBACK_MAP.get(this.rating),
      packagingRating: dataFormValue?.packaging ? rateValue : 0,
      tasteRating: dataFormValue?.taste ? rateValue : 0,
      quantityCareRating: dataFormValue?.quantity ? rateValue : 0,
      transportRating: dataFormValue?.transport ? rateValue : 0,
      ripenessRating: dataFormValue?.ripeness ? rateValue : 0,
      otherRating: dataFormValue?.other ? rateValue : 0,
    };

    if (dataFormValue.orderRatingComments) {
      feedbackObject.orderRatingComments = dataFormValue?.orderRatingComments;
    }

    if (feedbackObject && !this.isSendingInfo) {
      try {
        this.isSendingInfo = true;
        await this.crowdfarmerFeedbackSrv.sendFormInfo(feedbackObject);
        this.setFinalScreen(true);
      } catch (err) {
        this.setFinalScreen(false);
      }
    }
  }

  setFinalScreen(success: boolean): void {
    if (success) {
      this.finalInfo.text =
        this.rating === 'like' || this.rating === 'average'
          ? this.translocoSrv.translate('page.keep-improving.body')
          : this.translocoSrv.translate('page.remember-compensation-bad-experience.body');
      this.finalInfo.title = this.translocoSrv.translate('page.thank-you-experience.title');
      this.finalInfo.image = `${environment.domain}/assets/img/crowdfarmers-feedback/success-message-green.svg`;
    } else {
      this.finalInfo.text = this.translocoSrv.translate('page.error.body');
      this.finalInfo.title = this.translocoSrv.translate('page.error.title');
      this.finalInfo.image = `${environment.domain}/assets/img/crowdfarmers-feedback/error-message-yellow.svg`;
    }

    this.finalScreen = true;
  }

  setTargetRoute(): void {
    const routeWithNoLang = this.routerSrv.removeUrlLang(this.pageTrigger);
    const finalRoute = routeWithNoLang.includes('info') ? routeWithNoLang : '/private-zone/my-order/list';

    this.routerSrv.navigate(finalRoute);
  }
}
