import { Component, OnInit, Injector, ViewEncapsulation, OnDestroy, AfterViewInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { BasePage } from '@app/pages';
import { OrdersService, EventService, ProductService, TrackingService, TrackingConstants } from '@app/services';
import {
  ORDER_SECTION_TYPE,
  ORDER_STATUS,
  ORDER_STATUS_TRANSLATIONS,
  ORDER_TYPE,
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_STATUS_TRANSLATIONS,
} from '@constants/order.constants';
import { ORDER_STATUS_KEY_MAP, ORDER_TYPE_TOGGLE_MAP, SUBSCRIPTION_STATUS_KEY_MAP } from '../../../utils/maps/order.map';
import { ConfigService } from '@services/config/config.service';
import { SubscriptionService } from '@services/subscription/subscription.service';

import { REMOTE_CONFIG } from '@app/constants/remote-config.constants';

const SHOW_ALL_TRANSLATION_KEY = 'page.show-all.drop';

const SHOW_ALL_KEY = 'page.show-all.drop';

@Component({
  selector: 'list-page',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListPageComponent extends BasePage implements OnInit, AfterViewInit, OnDestroy {
  public isMobile: boolean;
  public orders: any;
  public orderSectionType = ORDER_SECTION_TYPE;
  links = [
    {
      key: 'page.user-account-cta-adopt-a-tree.button',
      link: 'ADOPTION',
      secondaryStyle: 'primary',
    },
    {
      key: 'page.user-account-cta-buy-a-box.button',
      link: 'BOXES',
      secondaryStyle: 'secondary',
    },
  ];

  public typeOfOrder = {
    individualOrders: {
      list: [],
      isIndividualOrders: true,
      isGroupOrders: false,
      isRecurrentOrders: false,
      getOrders: 'getIndividualOrders',
      currentPage: 1,
      currentFilter: SHOW_ALL_TRANSLATION_KEY,
      orderLength: 0,
      showNoOrderMsg: false,
      areThereOrders: true,
      totalPages: 0,
      limit: 10,
    },
    groupOrders: {
      list: [],
      isIndividualOrders: false,
      isGroupOrders: true,
      isRecurrentOrders: false,
      getOrders: 'getGroupOrders',
      currentFilter: SHOW_ALL_TRANSLATION_KEY,
      orderLength: 0,
      currentPage: 1,
      showNoOrderMsg: false,
      areThereOrders: true,
      totalPages: 0,
      limit: 10,
      remoteName: REMOTE_CONFIG.GROUP_ORDER_MARKET,
    },
    subscriptionOrders: {
      list: [],
      isIndividualOrders: false,
      isGroupOrders: false,
      isRecurrentOrders: true,
      getOrders: 'getSubscriptionOrders',
      currentFilter: SHOW_ALL_TRANSLATION_KEY,
      currentPage: 1,
      orderLength: 0,
      showNoOrderMsg: false,
      areThereOrders: true,
      totalPages: 0,
      limit: 10,
      remoteName: REMOTE_CONFIG.SUBSCRIPTION_MARKET,
    },
  };

  public start = 0;
  public changeType = false;
  public ordersSectionTranslate = [
    ORDER_TYPE_TOGGLE_MAP.get(ORDER_SECTION_TYPE.INDIVIDUAL_ORDERS),
    ORDER_TYPE_TOGGLE_MAP.get(ORDER_SECTION_TYPE.GROUP_ORDER),
    ORDER_TYPE_TOGGLE_MAP.get(ORDER_SECTION_TYPE.SUBSCRIPTION_ORDERS),
  ];
  public ordersSection: any = [
    ORDER_SECTION_TYPE.INDIVIDUAL_ORDERS,
    ORDER_SECTION_TYPE.GROUP_ORDER,
    ORDER_SECTION_TYPE.SUBSCRIPTION_ORDERS,
  ];
  public currentSection = ORDER_SECTION_TYPE.INDIVIDUAL_ORDERS;
  public currentTabOrder = 'currentTabOrder';
  public isIndividualOrders = true;
  public indexCurrentTab: number;
  public filterCanceledState = false;
  public isGOVisible = false;
  public isSubscriptionVisible = true;
  public ordersFiltered: any;
  public userId: string;
  public stateOptions = [
    SHOW_ALL_TRANSLATION_KEY,
    ...(Object.keys(ORDER_STATUS_TRANSLATIONS) as (keyof typeof ORDER_STATUS_TRANSLATIONS)[])
      .filter((key) => ![ORDER_STATUS.DECLINED, ORDER_STATUS.PAID, ORDER_STATUS.REFUNDED].includes(key))
      .map((key) => ORDER_STATUS_TRANSLATIONS[key]),
  ];
  public stateOptionsGroup = [
    SHOW_ALL_TRANSLATION_KEY,
    ...(Object.keys(ORDER_STATUS_TRANSLATIONS) as (keyof typeof ORDER_STATUS_TRANSLATIONS)[])
      .filter((key) => ![ORDER_STATUS.ADOPTED, ORDER_STATUS.DECLINED, ORDER_STATUS.PAID, ORDER_STATUS.REFUNDED].includes(key))
      .map((key) => ORDER_STATUS_TRANSLATIONS[key]),
  ];

  public stateOptionsSubscription = [
    SHOW_ALL_TRANSLATION_KEY,
    ...(Object.keys(SUBSCRIPTION_STATUS_TRANSLATIONS) as (keyof typeof SUBSCRIPTION_STATUS_TRANSLATIONS)[])
      .filter((key) => ![SUBSCRIPTION_STATUS.PENDING].includes(key))
      .map((key) => SUBSCRIPTION_STATUS_TRANSLATIONS[key]),
  ];

  public isFirstLoadGroupOrder = true;

  constructor(
    public injector: Injector,
    private ordersSrv: OrdersService,
    private productSrv: ProductService,
    public eventSrv: EventService,
    public configSrv: ConfigService,
    public translocoSrv: TranslocoService,
    public subscriptionSrv: SubscriptionService,
    private trackingSrv: TrackingService
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    const getUserInfo = await this.userService.get();

    this.userId = getUserInfo._id;

    this.route.queryParams.subscribe((params) => {
      this.selectTab(params.tab);
    });

    // Listens to private zone components to notice which one is open
    this.eventSrv.dispatchEvent('private-zone-url', { router: this.routerSrv.getPath() });
    this.isMobile = this.domSrv.getIsDeviceSize();
    this.disableSubscriptionTabRemoteConfig();
    this.disableGroupOrderTabRemoteConfig();

    this.ordersSectionTranslate = this.ordersSectionTranslate.map((name) => this.translocoSrv.translate(name));
    void this.handleStorageTab(this.currentSection);
  }

  // allowes to pass pages in desktop size
  public async paginate(page: number): Promise<void> {
    this.setInnerLoader(true, false);
    this.typeOfOrder[this.currentSection].currentPage = page;
    const filter =
      this.typeOfOrder[this.currentSection].currentFilter === SHOW_ALL_TRANSLATION_KEY
        ? null
        : this.typeOfOrder[this.currentSection].currentFilter;

    await this.getAndSetOrders(filter);

    this.domSrv.scrollToTop();
    this.setInnerLoader(false, false);
  }

  public async filterState(state: string): Promise<void> {
    this.typeOfOrder[this.currentSection].currentPage = 1;

    await this.getAndSetOrders(state);

    if (state === ORDER_STATUS_TRANSLATIONS.adopted) {
      state = ORDER_STATUS_TRANSLATIONS.sent;
      this.changeType = true;
      this.typeOfOrder[this.currentSection].currentFilter = ORDER_STATUS_TRANSLATIONS.adopted;
    } else {
      this.typeOfOrder[this.currentSection].currentFilter = state;
    }

    this.checkIfFilterEmpty();
  }

  /**
   * navigateToFarmersMarket
   */
  public navigateToFarmersMarket(currentSection: string): void {
    let route;

    switch (currentSection) {
      case ORDER_SECTION_TYPE.GROUP_ORDER:
      case ORDER_SECTION_TYPE.SUBSCRIPTION_ORDERS:
        route = 'BOXES';
        break;
      case ORDER_SECTION_TYPE.INDIVIDUAL_ORDERS:
        route = 'ADOPTION';
        break;
      default:
        route = 'ADOPTION';
        break;
    }

    this.routerSrv.navigateToFarmersMarket(route);
  }

  public async getAndSetOrders(state: string = null): Promise<void> {
    const filter =
      this.currentSection === ORDER_SECTION_TYPE.SUBSCRIPTION_ORDERS
        ? state === SHOW_ALL_KEY
          ? null
          : SUBSCRIPTION_STATUS_KEY_MAP.get(state)
        : state === SHOW_ALL_KEY
        ? null
        : ORDER_STATUS_KEY_MAP.get(state);

    await this[this.typeOfOrder[this.currentSection].getOrders](filter);
  }

  private async getIndividualOrders(state: string = null): Promise<void> {
    const ordersData = await this.ordersSrv.getUserOrders(
      (this.typeOfOrder.individualOrders.currentPage - 1) * this.typeOfOrder.individualOrders.limit,
      state
    );

    this.orders = ordersData.list;
    this.typeOfOrder.individualOrders.list = ordersData.list;
    this.typeOfOrder.individualOrders.areThereOrders = !!this.orders.length;
    this.typeOfOrder.individualOrders.showNoOrderMsg = !!(!this.orders.length && state);

    if (state === ORDER_STATUS_TRANSLATIONS.adopted) {
      this.orders = this.orders.filter((order) => order.orderType === ORDER_TYPE.ORDER_MULTI_SHOT_ADOPTION);
    } else if (state === ORDER_STATUS_TRANSLATIONS.sent) {
      this.orders = this.orders.filter((order) => order.orderType !== ORDER_TYPE.ORDER_MULTI_SHOT_ADOPTION);
    }

    // Ger order type
    this.orders.map((order) => this.productSrv.productType(order));

    // Checks current order delivery status if not cancelled
    this.ordersSrv.assingOrderStatus(this.orders);
    this.ordersFiltered = this.orders;

    // get the total possible pages
    this.typeOfOrder.individualOrders.orderLength = ordersData.count;
    this.typeOfOrder.individualOrders.totalPages = Math.ceil(
      this.typeOfOrder.individualOrders.orderLength / this.typeOfOrder.individualOrders.limit
    );

    this.setLoading(false);
    this.setInnerLoader(false, false);
  }

  private async getGroupOrders(state?: ORDER_STATUS): Promise<void> {
    const groupOrdersData = await this.ordersSrv.getGroupOrderList(
      (this.typeOfOrder.groupOrders.currentPage - 1) * this.typeOfOrder.groupOrders.limit,
      state
    );

    this.typeOfOrder.groupOrders.orderLength = groupOrdersData.totalResults;
    this.typeOfOrder.groupOrders.list = groupOrdersData.list;
    this.typeOfOrder.groupOrders.totalPages = Math.ceil(this.typeOfOrder.groupOrders.orderLength / this.typeOfOrder.groupOrders.limit);
    this.typeOfOrder.groupOrders.areThereOrders = !!this.typeOfOrder.groupOrders.list.length;
    this.typeOfOrder.groupOrders.showNoOrderMsg = !!(!this.typeOfOrder.groupOrders.list.length && state);
    this.filterCanceledState = state === ORDER_STATUS_TRANSLATIONS.cancelled;
  }

  private async getSubscriptionOrders(state?: SUBSCRIPTION_STATUS): Promise<void> {
    const subscriptionOrdersData = await this.subscriptionSrv.getSubscriptionOrders(
      this.userId,
      state,
      (this.typeOfOrder.subscriptionOrders.currentPage - 1) * this.typeOfOrder.subscriptionOrders.limit
    );

    this.typeOfOrder.subscriptionOrders.orderLength = subscriptionOrdersData.count;
    this.typeOfOrder.subscriptionOrders.list = subscriptionOrdersData.list;

    this.typeOfOrder.subscriptionOrders.totalPages = Math.ceil(
      this.typeOfOrder.subscriptionOrders.orderLength / this.typeOfOrder.subscriptionOrders.limit
    );

    this.typeOfOrder.subscriptionOrders.areThereOrders = !!this.typeOfOrder.subscriptionOrders.list.length;
    this.typeOfOrder.subscriptionOrders.showNoOrderMsg = !!(!this.typeOfOrder.subscriptionOrders.list.length && state);
    this.filterCanceledState = state === ORDER_STATUS_TRANSLATIONS.cancelled;
  }

  public async toggleOrderPage(index: number): Promise<void> {
    this.currentSection = this.ordersSection[index];

    if (!this.typeOfOrder[this.currentSection].list.length) {
      await this[this.typeOfOrder[this.currentSection].getOrders]();
    }

    this.storageSrv.set(this.currentTabOrder, this.currentSection);
  }

  public async handleStorageTab(currentTab: any): Promise<void> {
    const currentTabOrders = await this.storageSrv.get(this.currentTabOrder);
    const properTab = currentTabOrders || currentTab;

    this.indexCurrentTab = this.ordersSection.indexOf(properTab);
    currentTabOrders && (await this.toggleOrderPage(this.indexCurrentTab));
  }

  public checkIfTabEmpty(): boolean {
    return this.typeOfOrder[this.currentSection].areThereOrders;
  }

  public checkIfFilterEmpty(): boolean {
    return this.typeOfOrder[this.currentSection].showNoOrderMsg;
  }

  private disableSubscriptionTabRemoteConfig(): void {
    this.disableTabWithRemoteConfig(this.typeOfOrder.subscriptionOrders.remoteName, ORDER_SECTION_TYPE.SUBSCRIPTION_ORDERS);
  }

  private disableGroupOrderTabRemoteConfig(): void {
    this.disableTabWithRemoteConfig(this.typeOfOrder.groupOrders.remoteName, ORDER_SECTION_TYPE.GROUP_ORDER);
  }

  private disableTabWithRemoteConfig(remoteName: string, tabName: string): void {
    this.configSrv.getBoolean(remoteName).subscribe((isVisible) => {
      if (!isVisible) {
        this.deleteTabFromArrays(tabName);
      }
    });
  }

  private deleteTabFromArrays(tabName: string): void {
    const index = this.ordersSection.indexOf(tabName);

    this.ordersSectionTranslate.splice(index, 1);
    this.ordersSection.splice(index, 1);
  }

  private selectTab(tab = ORDER_SECTION_TYPE.INDIVIDUAL_ORDERS): void {
    const tabIndex = this.ordersSection.findIndex((item) => item === tab);

    if (!this.ordersSection[tabIndex]) {
      this.loggerSrv.error('Tab of orders not found');
      this.showErrorPopup();

      return;
    }

    this.currentSection = this.ordersSection[tabIndex];
    this.indexCurrentTab = tabIndex;
    this.storageSrv.set(this.currentTabOrder, this.currentSection);

    void this.toggleOrderPage(tabIndex);
  }

  public getE2ePurchaseId(order: any): string {
    return (
      (order.paymentMethods?.crowdfarmer.paymentRequest ? order.paymentMethods.crowdfarmer.paymentRequest.id.id : order._id) + order._up
    );
  }

  ngAfterViewInit(): void {
    const customEventData = {
      cf_page_title: TrackingConstants.GTM4.CF_PAGE_TITLE.ACCOUNT_MY_ORDERS,
      page_type: TrackingConstants.GTM4.PAGE_TYPE.MY_ACCOUNT,
      language: this.langSrv.getCurrentLang(),
      country_delivery: this.countrySrv.getCurrentCountry()?.iso,
    };

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.PAGE_VIEW, false, customEventData);
  }

  ngOnDestroy(): void {
    !this.routerSrv.getIsOrdersPath() && this.storageSrv.clear(this.currentTabOrder);
  }
}
