import { Component, Injector, Input, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from '@components/base';
import { RouterService, TrackingService, TrackingConstants, TrackingGA4Prefixes } from '@app/services';
import { LandingsService } from '@services/landing';
import { IEcommerceTracking } from '@app/interfaces';

@Component({
  selector: 'landing-promo',
  templateUrl: './landing-promo.component.html',
  styleUrls: ['./landing-promo.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LandingPromoComponent extends BaseComponent {
  @Input() project: any;
  @Input() countryName: string;
  @Input() index: number;
  @Input() lang: string;

  public startLazyAt = 6;

  constructor(
    public injector: Injector,
    public routerSrv: RouterService,
    private trackingSrv: TrackingService,
    private landingSrv: LandingsService,
  ) {
    super(injector);
  }

  /**
   * Promotion handler
   */
  public clickPromotion(e: Event, project: any): void {
    e.preventDefault();
    if (!project.availableBoxes) {
      return;
    }

    const LANDING_ID: string = this.landingSrv.getCurrentLandingEnglishCode();
    const items = [];
    const listName = this.trackingSrv.buildListName(project._m_title?.en, `${TrackingGA4Prefixes.MARKETING_LANDING}${LANDING_ID}/`);

    this.trackingSrv.setInterimList('LandingsMKT');
    this.trackingSrv.setInterimGA4List(listName);
    this.trackingSrv.setPosition(this.index + 1);
    this.trackingSrv.trackEvent(TrackingConstants.GTM.EVENTS.PRODUCT_CLICK, true, {
      click: {
        actionField: { list: 'LandingsMKT' },
        products: [
          {
            name: project.upCode,
            id: project._id,
            category: project.category,
            brand: project.brandName,
            position: this.index + 1,
          },
        ],
      },
    });
    // TODO: fill in with IEcommerceTracking
    // I think this is no longer used with landings using new agroupments
    items.push({
      index: this.index + 1,
      item_brand: project.farm?._m_name?.en,
      currency: project.filters?.price?.currency?.crowdfarmer?.currency,
      price: project.filters?.price?.amount, // update if landing has adoptions
      item_variant: TrackingConstants.ITEM_VARIANT.OH, // update if landing has adoptions
      quantity: 1,
      item_id: project.up?.id,
      item_category: project.up?.category?._m_name?.en, // ask BE to provide this
      item_category2: project.up?.subcategory?._m_name?.en, // ask BE to provide this
      item_category3: project.up?._m_variety?.en,
      item_category4: project.up?._m_subvariety?.en, // ask BE to provide this
      item_list_name: listName,
      item_name: project.code,
      // cart_number_items
      // product_id: e.code, product category id ?
      product_code: project.code,
      // product_project_code: product_id + e.code
      // product_page:
      // product_delivery_plan:
      // product_cost_calculator:
      // product_stock:
      // product_units_left:
      // product_days_left:
      // farmer_country:
      // product_soon:
      // link_type:
      // search_term:
      // product_gift:
    } as IEcommerceTracking);

    this.trackingSrv.trackEventGA4(TrackingConstants.GTM4.EVENTS.VIEW_ITEM_LIST, true, { items });
    this.routerSrv.navigate(this.project._m_link[this.lang]);
  }
}
