import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LangService } from '../../../services';

@Component({
  selector: 'download-app',
  templateUrl: './download-app.component.html',
})
export class DownloadAppComponent implements OnInit, OnDestroy {
  @Input() isMobile: boolean;
  lang = this.langSrv.getCurrentLang();
  langSubscription: Subscription;
  constructor(public injector: Injector, public langSrv: LangService) {}

  ngOnInit(): void {
    this.langSubscription = this.langSrv.getCurrent().subscribe((lang) => {
      this.lang = lang;
    });
  }

  ngOnDestroy(): void {
    this.langSubscription.unsubscribe();
  }
}
