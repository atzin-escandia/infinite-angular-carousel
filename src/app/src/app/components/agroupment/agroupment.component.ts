import { Component, Injector, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from '@components/base';
import { PROJECT_CARD_SIZE, PROJECT_TYPE } from '@constants/landing.constants';
import { MasterBox } from '@interfaces/master-box.interface';
import { CardService } from '@modules/farmers-market/services/card.service';
import { AgroupmentService } from '@services/agroupments';
import { FavouriteService, StateService, TrackingConstants } from '@app/services';
import { UnknownObjectType } from '@app/interfaces';
import { FavouritesSection } from '@interfaces/favourites.interface';

@Component({
  selector: 'agroupment-component',
  templateUrl: './agroupment.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class AgroupmentComponent extends BaseComponent implements OnInit {
  @Input() agroupment: UnknownObjectType;
  @Input() isLoading: boolean;
  @Input() type: string;
  @Input() path: string;
  @Input() currentCountry: UnknownObjectType;
  FavouriteSection = FavouritesSection;

  PROJECT_TYPE = PROJECT_TYPE;
  currentLang: string;
  currentLangSubscription: any;
  dummySkeleton = {
    adoptions: [1, 2, 3],
    boxes: [1, 2, 3, 4],
  };

  constructor(
    public injector: Injector,
    public cardSrv: CardService,
    public agroupmentSrv: AgroupmentService,
    public stateSrv: StateService,
    public favouriteSrv: FavouriteService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.currentLang = this.langSrv.getCurrentLang();
    this.favouriteSrv.setCrowdfarmer();
  }

  setSelectedMb(event: any, project: any): void {
    project.selectedMb = project?.filters?.masterBoxes?.find((mb: MasterBox) => mb.id === event?.id);
  }

  setSizeAgroupment(): string {
    return this.type === PROJECT_TYPE.ADOPTIONS ? PROJECT_CARD_SIZE.WIDE : PROJECT_CARD_SIZE.NARROW;
  }

  addToCart(project: any, index: number, home = false, title: string): void {
    this.agroupmentSrv.addToCart(project, index, home, this.type, title);
  }

  handleCardClick(project: UnknownObjectType, index: number, agroupment: UnknownObjectType): void {
    const agroupmentEnglishTitle = agroupment?._m_title[TrackingConstants.DEFAULT_TRACKING_LANGUAGE];

    this.cardSrv.navigateToDetail(project);
    this.agroupmentSrv.trackClickPromotion(project, index, this.type, agroupmentEnglishTitle);
  }
}
