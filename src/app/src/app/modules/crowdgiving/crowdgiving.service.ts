import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrowdgivingStoreService } from './store/store.service';
import { EventService, LoaderService } from '@app/services';

@Injectable()
export class CrowdgivingPageService {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loaderSrv: LoaderService,
    private eventSrv: EventService,
    private cgStoreSrv: CrowdgivingStoreService,
  ) {}

  setLoading(set: boolean): void {
    this.loaderSrv.setLoading(set);
  }

  setInnerLoader(set: boolean, page: boolean): void {
    this.eventSrv.dispatchEvent('loading-animation', { set, isPage: page });
  }

  navToSection(sectionIdx: number): Promise<boolean> {
    this.cgStoreSrv.setCurrentSectionIdx(sectionIdx);

    return this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        section: this.cgStoreSrv.sections[sectionIdx].path,
      },
    });
  }
}
