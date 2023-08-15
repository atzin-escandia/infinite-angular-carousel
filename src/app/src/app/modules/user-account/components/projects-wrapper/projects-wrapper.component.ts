import { Component, Input, Injector, OnChanges } from '@angular/core';
import { BaseComponent } from '@app/components';
import { MasterBox } from '@interfaces/master-box.interface';
import { OVERHARVEST, UBER_UPS } from '@pages/farmer/up/constants/up.constants';
import { CartsService, FavouriteService, LangService, StateService, TrackingConstants, TrackingService } from '@app/services';
import { CardService } from '../../../farmers-market/services/card.service';
import { UnknownObjectType } from '@app/interfaces';
import { TrackingImpressionIds } from '@enums/filters.enum';
import { FavouritesSection } from '@interfaces/favourites.interface';
import { PROJECT_TYPE } from '@constants/landing.constants';

@Component({
  selector: 'projects-wrapper',
  templateUrl: './projects-wrapper.component.html',
  styleUrls: ['./projects-wrapper.component.scss'],
})
export class ProjectsWrapperComponent extends BaseComponent implements OnChanges {
  @Input() isOH = false;
  @Input() projects: any;

  searchPath: string;
  userAccountSection = FavouritesSection.USER_ACCOUNT;
  projectType = PROJECT_TYPE;

  constructor(
    public injector: Injector,
    public cardSrv: CardService,
    public favouriteSrv: FavouriteService,
    private trackingSrv: TrackingService,
    private cartSrv: CartsService,
    public stateSrv: StateService,
    public langSrv: LangService
  ) {
    super(injector);
  }

  async ngOnChanges(): Promise<void> {
    await this.cardSrv.setProjectSeals(this.projects);
    this.cardSrv.setDefaultMasterBox(this.projects);

    this.projects.forEach((project) => {
      project.mbsInfo = this.cardSrv.getMbsInfo(project.filters?.masterBoxes);
      project.options = this.cardSrv.setDiscount(project.mbsInfo, project.filters.masterBoxes);
    });
  }

  addToCart(project: any, index: number, home = false): void {
    const availableMb = this.cardSrv.getAvailableMb(project.filters.masterBoxes);

    if (project && !project.emptySeason && !project.inactiveSeason && this.cardSrv.isMbAvailable(project.selectedMb || availableMb)) {
      const isUberUp = project.up.typeUpSell === UBER_UPS;

      this.trackingSrv.trackEvent(
        TrackingConstants.GTM.EVENTS.ADD_TO_CART,
        true,
        {
          add: {
            products: [
              {
                price: project.selectedMb?.ohPrice.amount || availableMb.ohPrice.amount,
                quantity: 1,
                variant: TrackingConstants.GTM.PARAMS.OVERHARVEST,
                name: project.code,
                id: project.up.id,
                category: project.up._m_up[this.langSrv.getCurrentLang()],
                brand: project.farmer.brandName,
                position: index + 1,
              },
            ],
          },
        },
        home ? TrackingConstants.GTM.ACTIONS.HOME : TrackingConstants.GTM.ACTIONS.FARMER_MARKET
      );

      this.cartSrv.add(
        'overharvest',
        {
          _id: project.up.id,
          _m_up: project.up._m_up,
          _m_slug: project.up._m_upSlug,
        },
        null,
        null,
        project.selectedMb?.id || availableMb.id,
        {
          numMasterBoxes: 1,
        },
        null,
        project.farmer.slug,
        { oneShot: false, multiShot: false, uberUp: isUberUp }
      );

      project.up.masterBox = project.selectedMb || availableMb;

      this.popoverSrv.open('ProductNotificationComponent', 'header-notification-container', {
        inputs: {
          product: {
            type: OVERHARVEST,
            name: project.farm._m_name[this.langSrv.getCurrentLang()],
            up: project.up,
            price: project.selectedMb?.ohPrice.amount || availableMb.ohPrice.amount,
            boxes: 1,
          },
          imageURL: project.up.cardOHImageURL,
          customClose: () => {
            this.popoverSrv.close('ProductNotificationComponent');
            delete project.up.masterBox;
          },
        },
        outputs: {},
      });
    }
  }

  setSelectedMb(event: any, project: any): void {
    project.selectedMb = project.filters.masterBoxes.find((mb: MasterBox) => mb.id === event.id);
  }

  handleCardClick(project: UnknownObjectType, index: number): void {
    this.cardSrv.navigateToDetail(project, this.favouriteSrv.projectType$.getValue());
    this.trackClickPromotion(project, index);
  }

  setTrackingIdImpressions(): string {
    let list: string;

    if (this.favouriteSrv.projectType$.getValue() === 'adoptions') {
      list = this.searchPath ? TrackingImpressionIds.SEARCH_RESULTS_ADOPT : TrackingImpressionIds.FARMERS_MARKET_ADOPTIONS;
    } else {
      list = this.searchPath ? TrackingImpressionIds.SEARCH_RESULTS_OH : TrackingImpressionIds.FARMERS_MARKET_OH;
    }

    this.searchPath === 'all' && (list = TrackingImpressionIds.SEARCH_RESULTS_ALL);
    this.trackingSrv.setInterimList(list);

    return list;
  }

  trackClickPromotion(project: any, index: number): void {
    if (!this.favouriteSrv.projectType$.getValue() || !project) {
      return;
    }

    const list = this.setTrackingIdImpressions();

    this.trackingSrv.setPosition(index + 1);
    this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.PRODUCT_CLICK, true, {
      click: {
        actionField: { list },
        products: [
          {
            name: project.code,
            id: project.up?.id,
            category: project.up?._m_up[this.langSrv.getCurrentLang()],
            brand: project.farmer?.brandName,
            position: index + 1,
          },
        ],
      },
    });
  }
}
