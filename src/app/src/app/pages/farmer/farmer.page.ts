import {Component, OnInit, Injector} from '@angular/core';

import {BasePage} from '../base';

@Component({
  selector: 'farmer-page',
  templateUrl: './farmer.page.html',
  styleUrls: ['./farmer.page.scss']
})
export class FarmerPageComponent extends BasePage implements OnInit {
  constructor(public injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.setLoading(false);
    this.setInnerLoader(false, false);
  }
}
