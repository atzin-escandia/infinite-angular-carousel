import {Component, OnInit, ChangeDetectorRef, AfterContentChecked} from '@angular/core';
import {PopupsInterface} from '../popups.interface';
import {PopupsRef} from '../popups.ref';
import {TextService} from '../../services/text';

@Component({
  selector: 'promos-sort-popup',
  templateUrl: './promos-sort.component.html',
  styleUrls: ['./promos-sort.component.scss']
})
export class PromosSortPopupComponent implements OnInit, AfterContentChecked {
  public sortCriteria: any;
  public onClose: any;
  public clicked: number;

  constructor(public config: PopupsInterface, public popup: PopupsRef, public textSrv: TextService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.sortCriteria = this.config.data.sortCriteria;
    this.clicked = this.config.data.clicked;
  }

  sort(id: number): void {
    this.onClose(id);
  }

  // Need to prevent error
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }
}
