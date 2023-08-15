import { AfterViewInit, Component, Injector, OnDestroy } from '@angular/core';
import { BasePage } from '@app/pages';
import { UserActiveSubscription } from '@app/pages/subscription-box/interfaces/subscription-box.interface';
import { SubscriptionBoxService } from '@app/pages/subscription-box/services';
import { TranslocoService } from '@ngneat/transloco';
import { Observable, Subject, catchError, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'my-subscriptions',
  templateUrl: './my-subscriptions.page.html',
  styleUrls: ['./my-subscriptions.page.scss'],
})
export class MySubscriptionsPageComponent extends BasePage implements AfterViewInit, OnDestroy {
  destroy$ = new Subject<void>();
  subscriptionSubject$ = new Subject<void>();
  subscription$ = this.getSubscription$();

  constructor(public injector: Injector, public translocoSrv: TranslocoService, private subscriptionBoxSrv: SubscriptionBoxService) {
    super(injector);
  }

  ngAfterViewInit(): void {
    this.subscriptionSubject$.next();
    this.eventSrv.dispatchEvent('private-zone-url', { router: this.routerSrv.getPath() });
  }

  getSubscription$(): Observable<UserActiveSubscription> {
    return this.subscriptionSubject$.pipe(
      switchMap(() =>
        this.subscriptionBoxSrv.getUserSubscription(this.userService.getCurrentUser()._user).pipe(
          catchError((error) => {
            if (error !== 'Empty request') {
              this.subscriptionBoxSrv.showErrorToast();
            }
            console.error('An error occurred:', error?.error?.msg);
            this.setInnerLoader(false, false);

            return of();
          }),
          tap(() => this.setInnerLoader(false, false))
        )
      )
    );
  }

  navigateToDiscoveryBoxLanding(): void {
    this.routerSrv.navigate('/subscription-box');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
