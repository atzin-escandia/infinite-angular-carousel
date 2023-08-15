import {Location} from '@angular/common';
import {Injectable, Injector} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import dayjs from 'dayjs';
import {ConfigService} from '../../services/config/config.service';
import {BaseService} from '../../services';
import {BOX_QUERY_PARAM_LENGTH} from './constants/farmer.constants';
import {ISelectedMbData} from './interfaces/selected-mb-data.interface';
import {REMOTE_CONFIG} from '@app/constants/remote-config.constants';

@Injectable()
export class FarmerPageService extends BaseService {
  public showSmallBoxFirst = false;

  constructor(
    public injector: Injector,
    public router: Router,
    public route: ActivatedRoute,
    private location: Location,
    private configSrv: ConfigService
  ) {
    super(injector);
  }

  // Mandatory implementation
  public init(): void {
    this.configSrv.getBoolean(REMOTE_CONFIG.SHOW_SMALL_BOX_FIRST).subscribe(v => this.showSmallBoxFirst = v);
  }

  public getSelectedMbIndexAndBoxParam(up: any): ISelectedMbData {
    const boxParam = this.route.snapshot.queryParamMap.get('box');
    const indexOfBoxParam = up.masterBoxes.findIndex((mb: any) => mb._id.substr(-BOX_QUERY_PARAM_LENGTH) === boxParam);
    const isThereBoxFromParam = !!up.masterBoxes[indexOfBoxParam];
    const isAvailableBoxFromParam = !!up.masterBoxes[indexOfBoxParam]?.firstDate;
    const isThereAnyAvailableBox = up.masterBoxes.some((mb: any) => mb.firstDate);
    const firstAvailableBox = this.getFirstAvailableBox(up.masterBoxes);
    let indexOfFirstAvailableBox = 0;

    if (firstAvailableBox && !this.showSmallBoxFirst) {
      indexOfFirstAvailableBox = up.masterBoxes.findIndex((mb: any) => mb._id.toString() === firstAvailableBox._id.toString());
    } else if (this.showSmallBoxFirst) {
      indexOfFirstAvailableBox = up.masterBoxes.findIndex((mb: any) => mb.firstDate);
    }
    const selectedMbIndex = this.getSelectedMasterBoxIndex(
      isThereAnyAvailableBox, isThereBoxFromParam, isAvailableBoxFromParam, indexOfFirstAvailableBox, indexOfBoxParam);

    return {selectedMbIndex, boxParam};
  }

  private getFirstAvailableBox(masterBoxes: any[]): any {
    masterBoxes = masterBoxes.filter((mb: any) => mb.firstDate)
      .sort((a, b) => dayjs.utc(a.firstDate).unix() - dayjs.utc(b.firstDate).unix());

    return masterBoxes.length ? masterBoxes[0] : null;
  }

  public getSelectedMasterBoxIndex(
    isThereAnyAvailableBox: boolean,
    isThereBoxFromParam: boolean,
    isAvailableBoxFromParam: boolean,
    indexOfFirstAvailableBox: number,
    indexOfBoxParam: number): number {

    let selectedMasterBoxIndex = 0;

    isThereAnyAvailableBox && (selectedMasterBoxIndex = indexOfFirstAvailableBox);

    if (isAvailableBoxFromParam || (isThereBoxFromParam && !isThereAnyAvailableBox)) {
      selectedMasterBoxIndex = indexOfBoxParam;
    }

    return selectedMasterBoxIndex;
  }

  /**
   * We set the box param in the url
   * We keep an approach based on location for this issue https://github.com/angular/angular/issues/26744
   * There are some proposals as workarounds, however for our use case are not working
   * i.e. https://gist.github.com/iffa/9c820072135d25a6372d58075fe264dd
   *
   * @param up
   */
  public setBoxQueryParam(up: any): void {
    const urlTree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: {
        box: up.selectedMasterBox._id.substr(-BOX_QUERY_PARAM_LENGTH),
      },
      queryParamsHandling: 'merge',
    });

    this.location.go(urlTree.toString());
  }
}
