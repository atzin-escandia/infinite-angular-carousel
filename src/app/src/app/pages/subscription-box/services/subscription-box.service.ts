import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import {
  BoxSubscription,
  DiscoveryBoxFirebaseParams,
  SubscriptionPlan,
  SubscriptionPlanJson,
  SubscriptionStripePlan,
  SubscriptionStripePlanJson,
  UserActiveSubscription,
  UserSubscriptionJson,
} from '@app/pages/subscription-box/interfaces/subscription-box.interface';
import { EMPTY, Observable, catchError, filter, map, of, switchMap, throwError } from 'rxjs';

import { BaseService, ConfigService, StorageService } from '@app/services';
import { ToastService } from '@crowdfarming/ds-library';
import { TranslocoService } from '@ngneat/transloco';
import { environment } from '../../../../environments/environment';
import { DISCOVERY_BOX_FIREBASE_PARAMS } from '../constants/subscription-box.constants';
import { deserializeActiveSubscription, deserializePlan } from './subscription-box.helper';

const DB_SUBSCRIPTIONS_PLANS = 'v1/db-subscriptions/plans/';
const DB_SUBSCRIPTIONS_CROWDFARMER = 'v1/crowdfarmers/';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionBoxService extends BaseService {
  constructor(
    public injector: Injector,
    public storageSrv: StorageService,
    public configSrv: ConfigService,
    private http: HttpClient,
    private toastSrv: ToastService,
    private translocoSrv: TranslocoService
  ) {
    super(injector);
  }

  getPlans(): Observable<SubscriptionStripePlan[]> {
    return this.http
      .get<SubscriptionStripePlanJson>(`${environment.capi.host}${DB_SUBSCRIPTIONS_PLANS}`)
      .pipe(map((response) => response.data));
  }

  getSinglePlan(countryIso: string): Observable<SubscriptionPlan> {
    return this.getPlans().pipe(
      // Here we will search the plan by id in case we have many plans, instead of by intervalInMonths
      map((stripePlans) => stripePlans.find((plan) => plan.intervalInMonths === 1)),
      switchMap((stripePlan) =>
        this.http
          .get<SubscriptionPlanJson>(`${environment.capi.host}${DB_SUBSCRIPTIONS_PLANS}${stripePlan.id}/schedule?country=${countryIso}`)
          .pipe(
            map((planJson) => ({
              planJson,
              stripePlan,
            }))
          )
      ),
      map(({ planJson, stripePlan }) => deserializePlan(planJson.data.slice(0, 12), stripePlan))
    );
  }

  postSubscription(data: BoxSubscription, crowdfarmerId: string): Observable<BoxSubscription> {
    return this.http.post<BoxSubscription>(
      `${environment.capi.host}${DB_SUBSCRIPTIONS_CROWDFARMER}${crowdfarmerId}/db-subscriptions`,
      data
    );
  }

  getUserSubscription(userId: string): Observable<UserActiveSubscription> {
    return this.http.get<UserSubscriptionJson>(`${environment.capi.host}${DB_SUBSCRIPTIONS_CROWDFARMER}${userId}/db-subscriptions`).pipe(
      map((subscription) => subscription.data[0]),
      switchMap((subscription) => {
        if (!subscription || (Array.isArray(subscription) && subscription.length === 0)) {
          return throwError('Empty request');
        } else {
          return this.http
            .get<SubscriptionPlanJson>(
              `${environment.capi.host}${DB_SUBSCRIPTIONS_PLANS}${subscription.plan.id}/schedule?country=${subscription.countryCode}`
            )
            .pipe(
              map((planJson) => ({
                subscription,
                planJson,
              }))
            );
        }
      }),

      map(({ subscription, planJson }) => deserializeActiveSubscription(subscription, planJson.data))
    );
  }

  showErrorToast(): void {
    this.toastSrv.pushToast({
      text: this.translocoSrv.translate('notification.action-error.text-info'),
      icon: 'alert-triangle',
      type: 'danger',
      isClosable: true,
    });
  }

  // Firebase
  private discoveryBoxFirebaseParams$: Observable<DiscoveryBoxFirebaseParams> = this.configSrv
    .getValue(DISCOVERY_BOX_FIREBASE_PARAMS)
    .pipe(map((config) => JSON.parse(config._value)));

  discoveryBoxMenuFirebase$: Observable<boolean> = this.discoveryBoxFirebaseParams$.pipe(map((params) => params.isDiscoveryBoxMenuActive));
  discoveryBoxUserAreaFirebase$: Observable<boolean> = this.discoveryBoxFirebaseParams$.pipe(
    map((params) => params.isDiscoveryBoxUserAreaActive)
  );
}
