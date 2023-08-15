import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { WavesContainerModule } from '@app/components/home/waves-container/waves-container.module';
import { SharedModule } from '@app/modules/shared/shared.module';
import { SubscriptionPlan } from '@app/pages/subscription-box/interfaces/subscription-box.interface';
import { CFCurrencyPipe } from '@app/pipes/currency';
import { TranslocoService } from '@ngneat/transloco';
import { Observable, Subject, catchError, combineLatest, filter, of, switchMap, tap } from 'rxjs';
import { BasePage } from '../../../base';
import { NOT_VALID_COUNTRY_ERROR } from '../../constants/subscription-box.constants';
import { SubscriptionBoxService } from '../../services';
import { AccordionItems, BULLETS, BULLET_POINTS, BulletCard, FAQ_ITEMS } from './translation-strings';
import { StateService } from '@app/services';

const HERO_COLOR = 'orange';
const HERO_SIZE = 'l';
const HERO_IMAGE_SRC = '/assets/img/subscription-box/hero.png';
const CHECKOUT_URL = 'subscription-box/checkout';

@Component({
  selector: 'fruits-box-page',
  templateUrl: './fruits-box.page.html',
  styleUrls: ['./fruits-box.page.scss'],
  imports: [SharedModule, CommonModule, WavesContainerModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FruitsBoxLandingPageComponent extends BasePage implements AfterViewInit {
  bullets: BulletCard[] = BULLETS;
  bulletPoints: string[] = BULLET_POINTS;
  faqItems: AccordionItems[] = FAQ_ITEMS;
  heroColor = HERO_COLOR;
  heroSize = HERO_SIZE;
  heroImageSrc = `${this.env.domain}${HERO_IMAGE_SRC}`;

  currentLangIso$ = this.langSrv.currentLangIso$;
  currentCountry$ = this.stateSrv.$currentCountry;

  planSubject$ = new Subject<void>();
  plan$: Observable<SubscriptionPlan> = this.getPlan$();

  constructor(
    public injector: Injector,
    private subscriptionBoxService: SubscriptionBoxService,
    private translocoSrv: TranslocoService,
    private currencyPipeSrv: CFCurrencyPipe,
    private stateSrv: StateService
  ) {
    super(injector);
  }

  ngAfterViewInit(): void {
    this.currentCountry$.pipe(filter((countryIso) => countryIso !== null)).subscribe(() => this.planSubject$.next());
  }

  private getPlan$(): Observable<SubscriptionPlan> {
    return combineLatest([this.planSubject$, this.currentCountry$]).pipe(
      switchMap(([, countryIso]) =>
        this.subscriptionBoxService.getSinglePlan(countryIso).pipe(
          catchError((error) => {
            if (error?.error?.msg?.includes(NOT_VALID_COUNTRY_ERROR)) {
              this.routerSrv.navigate('subscription-box/unavailable');
            } else {
              this.subscriptionBoxService.showErrorToast();
              console.error('An error occurred:', error?.error?.msg);
            }
            this.setInnerLoader(false, false);

            return of();
          }),
          tap(() => this.setInnerLoader(false, false))
        )
      )
    );
  }

  tryButtonText(price: number): string {
    const tryText: string = this.translocoSrv.translate('discoverybox.global.landing.button');
    const monthText: string = this.translocoSrv.translate('discoverybox.page.subscription-details-per-month.body');

    return `${tryText} ${this.currencyPipeSrv.transform(price)}${monthText}`;
  }

  goToNextStep(): void {
    this.routerSrv.navigate(CHECKOUT_URL);
  }
}
