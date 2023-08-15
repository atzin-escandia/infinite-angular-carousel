import {Component, OnInit, Injector, Output, EventEmitter, OnDestroy, Input} from '@angular/core';
import {BaseComponent} from '../base';
import {Subscription} from 'rxjs';

@Component({
  selector: 'notification-language',
  templateUrl: './notification-language.component.html',
  styleUrls: ['./notification-language.component.scss']
})
export class NotificationLanguageComponent extends BaseComponent implements OnInit, OnDestroy {
  @Output() public returnData = new EventEmitter<string>();
  @Input() public selected?: string;

  public languages: any;
  private langSubscription: Subscription;

  public notificationLanguageSelect: any = [];
  public langSelect: any = [];

  public dataToReturn = '';

  constructor(public injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    // g ets languages names in current language
    this.languages = this.langSrv.getAvailableLangs(this.langSrv.getCurrentLang());
    this.dataToReturn = this.selected || this.languages[0].code;

    this.formatData();
    // subscribe to update notification language component according to current language
    this.langSubscription = this.langSrv.getCurrent().subscribe(lang => {
      this.languages = this.langSrv.getAvailableLangs(lang);
      this.formatData();
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  /**
   * Format data to send to component
   */
  public formatData(): void {
    // Format language array for visualization
    this.notificationLanguageSelect = [];
    this.langSelect = [];

    for (const lang of this.languages) {
      this.notificationLanguageSelect.push(lang.name);
      this.langSelect.push(lang.code);
    }
  }

  /**
   * Save language set on component
   */
  public saveLang(): void {
    this.returnData.emit(this.dataToReturn);
  }
}
