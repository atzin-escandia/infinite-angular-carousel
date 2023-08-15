import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { HeaderSeal } from '@app/interfaces';
import { TranslocoService } from '@ngneat/transloco';
import { Subscription } from 'rxjs';

// Pipe to translate header seals
// Example:
// {{ upSeals.header | translateSeals }}

@Pipe({
  name: 'translateSeals',
  pure: false
})
export class TranslateSealsPipe implements PipeTransform, OnDestroy{

  headerSeals?: HeaderSeal[];
  translocoSubscription?: Subscription;

  constructor(private translocoSrv: TranslocoService, private cdr: ChangeDetectorRef) { }

  ngOnDestroy(): void {
    this.translocoSubscription?.unsubscribe();
  }

  /**
   * Trasnform pipe
   */
  transform(value?: HeaderSeal[]): HeaderSeal[] {
    if (!this.headerSeals && value?.length) {
      this.headerSeals = value;

      this.translocoSubscription = this.translocoSrv.selectTranslation().subscribe(translations => {
        for (const headerSeal of this.headerSeals) {
          headerSeal.label = headerSeal.isTag ? translations[headerSeal.key] : headerSeal.label;
        }

        this.cdr.markForCheck();
      });

    }

    return this.headerSeals ?? [];
  }
}
