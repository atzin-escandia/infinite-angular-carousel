import { Injectable } from '@angular/core';
import { TransferStateService } from '@app/services/transfer-state';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ALL_SEALS, SEALS } from '../../constant';
import { ApiResource } from '../../../../resources/api-obs';
import { OptionsApi } from '../../../../resources/api-obs/interfaces/options.interface';
import { ResponseListDTO } from '@app/interfaces/response-dto.interface';
import { Seal } from '@app/interfaces';

@Injectable({
  providedIn: 'root',
})
export class SealsService {
  constructor(private apiRsc: ApiResource, private transferStateSrv: TransferStateService) {}

  /**
   * get all seals
   * If the state exists in the store we return the value, otherwise we call the backend
   *
   * @returns
   */
  getAll(): Observable<ResponseListDTO<Seal>> {
    const seals: ResponseListDTO<Seal> = this.transferStateSrv.get(ALL_SEALS);
    const options: OptionsApi = {
      service: SEALS,
    };

    if (seals) {
      return of(seals);
    }

    return this.apiRsc.get(options).pipe(
      tap({
        next: (data) => {
          this.transferStateSrv.set(ALL_SEALS, data);
        },
      })
    );
  }
}
