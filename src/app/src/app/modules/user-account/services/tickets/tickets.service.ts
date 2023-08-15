import { Injectable, Injector } from '@angular/core';

import { BaseService } from '../../../../services';
import { TicketsResource } from '../../resources';

@Injectable({
  providedIn: 'root',
})
export class TicketsService extends BaseService {
  constructor(private ticketsRsc: TicketsResource, public injector: Injector) {
    super(injector);
  }

  public async openTicket(ticketData: any): Promise<any> {
    const { ticket } = await this.ticketsRsc.openTicket(ticketData);

    return ticket;
  }

  public async addPhotos(images: any): Promise<any> {
    const fd = new FormData();

    fd.append('container', 'tickets');
    fd.append('enctype', 'multipart/form-data');
    images.map((file: any) => {
      fd.append('images', file, file.name);
    });

    return await this.ticketsRsc.addPhotos(fd);
  }
}
