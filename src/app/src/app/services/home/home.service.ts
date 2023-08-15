import {Injectable, Injector} from '@angular/core';
import {HomeResource} from '../../resources';

import {BaseService} from '../base/base.service';
import {TransferStateService} from '../transfer-state';
import {SlidesInfo, SlidesInfoJson} from '../../interfaces/slides';

import { Observable, map } from 'rxjs';
import { AcceleratorInfo, AcceleratorsInfoJson } from '../../interfaces/accelerators';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

const SLIDES_URL = 'v1/hero-slides/public';
const URL_ACCELERATORS = 'v1/accelerators/public';

@Injectable({
  providedIn: 'root'
})
export class HomeService extends BaseService {
  constructor(
    public injector: Injector,
    private transferStateSrv: TransferStateService,
    private HomeRsc: HomeResource,
    private http: HttpClient
  ) {
    super(injector);
  }

  // Mandatory implementation
  public init = (): void => null;

  public async getHome(): Promise<any> {

    const stateKey = 'home_header';
    let home = this.transferStateSrv.get(stateKey, null);

    if (home === null) {
      home = await this.HomeRsc.getHomeHeader();
      this.transferStateSrv.set(stateKey, home);
    }

    home = this.modelize(home);

    return home;
  }

  public async getMediaLogos(country: string): Promise<any> {
    let mediaLogos = await this.HomeRsc.getMediaLogos(country);

    mediaLogos = this.modelize(mediaLogos.list);

    return mediaLogos;
  }


  public async getCounters(): Promise<any> {
    let counters = await this.HomeRsc.getCounters();

    counters = this.modelize(counters);

    return counters;
  }

  getHeroSlides(): Observable<SlidesInfo[]> {
    return this.http.get<SlidesInfoJson>(`${environment.capi.host}${SLIDES_URL}`).pipe(map((response) => response.data.list));
  }

  getAccelerators(): Observable<AcceleratorInfo[]> {
    return this.http.get<AcceleratorsInfoJson>(`${environment.capi.host}${URL_ACCELERATORS}`).pipe(map((response) => response.data.list));
  }
}
