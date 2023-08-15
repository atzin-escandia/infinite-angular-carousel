import { Component, Injector, Input, ViewEncapsulation, OnInit, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '@components/base';
import { RouterService, AuthService, UserService } from '@app/services';

@Component({
  selector: 'invest-info',
  templateUrl: './invest-info.component.html',
  styleUrls: ['./invest-info.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class InvestInfoComponent extends BaseComponent implements OnInit {
  @Input() block: string;
  @Input() user: any;
  @Input() info: any;
  @Output() public investment = new EventEmitter<number>();
  public waveToColor: string;
  public waveFromColor: string;
  public amount = 100;
  public inputError = false;
  public mask = ['XXXXX'];
  public countriesToShow = 12;

  constructor(public injector: Injector, public routerSrv: RouterService, public authSrv: AuthService, public userSrv: UserService) {
    super(injector);
  }

  ngOnInit(): void {
    switch (this.block) {
      case 'first-block':
      case 'block-img-right':
        this.waveToColor = 'white';
        break;
      case 'second-block':
        this.waveToColor = 'grey';
        break;
      case 'third-block':
        this.waveToColor = 'primary';
        break;
      case 'fourth-block':
        this.waveToColor = 'black';
        break;
    }
  }

  public invest(): void {
    if (this.amount >= 10 && this.amount <= 50000) {
      this.investment.emit(this.amount);
    } else {
      this.inputError = true;
    }
  }

  public showMoreCountries(): void {
    this.countriesToShow = this.countriesToShow === 12 ? 100 : 12;
  }
}
