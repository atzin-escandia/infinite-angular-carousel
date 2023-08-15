import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { LangService } from '@app/services';
import { KlarnaService } from '@app/services/klarna/klarna.service';
import { combineLatest, Subscription } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { CheckoutStoreService } from '../../services';

@Component({
  selector: 'app-klarna-placement',
  templateUrl: './klarna-placement.component.html',
})
export class KlarnaPlacementComponent implements AfterViewInit, OnDestroy {
  @Input() dataKey: 'credit-promotion-auto-size' | 'top-strip-promotion-auto-size' = 'credit-promotion-auto-size';

  @ViewChild('klarnaPlacement') klarnaPlacement: ElementRef;

  private _subscription = new Subscription();

  constructor(private checkoutStoreSrv: CheckoutStoreService, private klarnaSrv: KlarnaService, private langSrv: LangService) {}

  ngAfterViewInit(): void {
    const { finalPrice } = this.checkoutStoreSrv;
    const currentLang = this.langSrv.getCurrentLang();

    this.klarnaPlacement.nativeElement.setAttribute('data-key', this.dataKey);
    this._refresh(Math.round(finalPrice * 100), currentLang);
    this._initObservables();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  private _initObservables(): void {
    const { finalPrice$ } = this.checkoutStoreSrv;

    const finalPriceObs = finalPrice$.pipe(map((finalPrice) => Math.round(finalPrice * 100)));
    const currentLangIsoObs = this.langSrv.getCurrent().pipe(map((val) => val || 'de'));

    const observable = combineLatest([finalPriceObs, currentLangIsoObs]).pipe(debounceTime(250));

    this._subscription = observable.subscribe(([finalPrice, currentLangIso]) => {
      this._refresh(finalPrice, currentLangIso);
    });
  }

  private _refresh(finalPrice: number, currentLangIso: string): void {
    const locale = this._mapLangToLocale(currentLangIso);

    if (locale) {
      this.klarnaPlacement.nativeElement.setAttribute('data-locale', locale);
      this.klarnaPlacement.nativeElement.setAttribute('data-purchase-amount', finalPrice);

      this.klarnaSrv.refreshPlacements();
    } else {
      throw new Error('Locale not found');
    }
  }

  private _mapLangToLocale(iso: string): string {
    const locales = {
      en: 'en-DE',
      de: 'de-DE',
      at: 'de-AT',
      es: 'es-ES',
      fr: 'fr-FR',
      nl: 'nl-NL',
      it: 'it-IT',
      sv: 'sv-SE',
    };

    return locales[iso] || iso;
  }
}
