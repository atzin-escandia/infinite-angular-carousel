import { Injectable, Injector } from '@angular/core';
import {
  ORDER_TYPE,
  ORDER_TICKET_STATUS,
  ORDER_DELIVERY_STATUS,
  ORDER_STATUS,
  PURCHASE_ROLE,
  GIFT_STATUS,
} from '@constants/order.constants';
import { AuthService } from '@services/auth';
import { BaseService } from '../base';
import { GroupOrderResource, OrdersResource } from '../../resources';
import { TextService } from '../text';
import { LangService } from '../lang';
import { ITagGroupOrder } from '../../modules/user-account/interfaces/order.interface';
import { mapRolePermissions } from '../../modules/user-account/utils/maps/order.map';

@Injectable({
  providedIn: 'root',
})
export class OrdersService extends BaseService {
  private cancelled = ['ORDER_CANCELLED', 'ORDER_REFUNDED', 'ORDER_REJECTED', 'ORDER_DECLINED'];

  constructor(
    private ordersRsc: OrdersResource,
    private groupOrdersRsc: GroupOrderResource,
    public injector: Injector,
    public textSrv: TextService,
    public langSrv: LangService,
    public authSrv: AuthService
  ) {
    super(injector);
  }

  /**
   * Get order by upCf
   */
  public async getByUpCf(upCfId: string, start: number): Promise<any> {
    const { list } = await this.ordersRsc.getByUpCf(upCfId, start);

    return list;
  }

  /**
   * Get my orders
   */
  public async getUserOrders(start: number, stateFilter: string = null): Promise<any> {
    return await this.ordersRsc.getUserOrders(start, stateFilter);
  }

  /**
   * Get order
   */
  public async get(id: string, lapiInfo: boolean = false): Promise<any> {
    const order = await this.ordersRsc.get(id, lapiInfo);

    return this.modelize(order);
  }

  /**
   * Change order address
   */
  public async changeAddress(id: string, address: any): Promise<any> {
    return await this.ordersRsc.changeAddress(id, address);
  }

  /**
   * Change order date
   */
  public async changeDate(id: string, date: string): Promise<any> {
    return await this.ordersRsc.changeDate(id, date);
  }

  /**
   * Cancel order
   */
  public async cancelOrder(id: string): Promise<any> {
    return await this.ordersRsc.cancelOrder(id);
  }

  /**
   * Get order
   */
  public async getDisputed(): Promise<any> {
    return await this.ordersRsc.getDisputed();
  }

  // Group order mock
  public async getGroupOrderList(start: number, filter?: ORDER_STATUS): Promise<any> {
    const result = await this.groupOrdersRsc.getGroupOrderList(start, filter);

    return {
      ...result,
      list: result.list.map((item) => {
        const tag: ITagGroupOrder = {
          type: filter,
          affectedOrders: item.statusAffectedOrders?.length,
        };

        return {
          ...item,
          ...(tag.type && { tag }),
        };
      }),
    };
  }

  public async canBeCancelled(id: string): Promise<any> {
    return await this.ordersRsc.cancellableOrder(id);
  }

  // TODO - Check type in function
  public assingOrderStatus(orders: any, isArr: boolean = true): void {
    const assingStatus = (order): void => {
      if (this.cancelled.indexOf(order.orderPaymentStatus) !== -1) {
        order.status = 'cancelled';
      } else if (order.orderTicketStatus === ORDER_TICKET_STATUS.ORDER_TICKET_OPENED) {
        order.status = 'Open incident';
      } else if (order.orderTicketStatus === ORDER_TICKET_STATUS.ORDER_TICKET_CLOSED) {
        order.status = 'Closed incident';
      } else if (
        order.orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_DELIVERY_ERROR ||
        order.orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_IN_TRANSIT_DELAYED
      ) {
        order.status = 'possible delay';
      } else if (order.orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_DELIVERED) {
        order.status = 'completed';
      } else if (order.orderDeliveryStatus === ORDER_DELIVERY_STATUS.ORDER_PENDING) {
        order.status = 'planned';
      } else {
        if (order.orderType === ORDER_TYPE.ORDER_MULTI_SHOT_ADOPTION) {
          order.status = 'adopted';
        } else {
          order.status = 'sent';
        }
      }
    };

    if (isArr) {
      orders.map((order: any) => assingStatus(order));
    } else {
      assingStatus(orders);
    }
  }

  public deliveryFeedback(deliveryFeedbackInfo: any): Promise<any> {
    return this.ordersRsc.deliveryFeedback(deliveryFeedbackInfo);
  }

  public checkUserProfile(orderDetail: any): any {
    const currentUser = this.authSrv.getCurrentUser();
    const isGiftOrder = !!orderDetail._gift;
    const isGroupOrder = !!orderDetail._purchaseInfo;
    const isGuest = isGroupOrder && orderDetail.purchaseRole === PURCHASE_ROLE.GUEST;
    const isGifter = isGiftOrder && orderDetail.gift._buyer === currentUser._id;
    let userRole = PURCHASE_ROLE.DEFAULT;

    if (isGroupOrder) {
      userRole = isGuest ? PURCHASE_ROLE.GUEST : PURCHASE_ROLE.PROMOTER;
    }

    if (isGiftOrder) {
      userRole = isGifter ? PURCHASE_ROLE.GIFTER : PURCHASE_ROLE.RECIPIENT;

      return mapRolePermissions(userRole, orderDetail);
    }

    return mapRolePermissions(userRole, orderDetail);
  }
}
