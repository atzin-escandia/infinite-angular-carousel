import { Component, OnInit } from '@angular/core';
import { PopupsInterface } from '../../../../popups/popups.interface';
import { PopupsRef } from '../../../../popups/popups.ref';

@Component({
  selector: 'photo-visor',
  templateUrl: './photo-visor.html',
  styleUrls: ['./photo-visor.scss']
})
export class PhotoVisorComponent implements OnInit {
  public photosArr: any[];

  constructor(public config: PopupsInterface, public popup: PopupsRef) { }

  ngOnInit(): void {
    this.photosArr = this.config.data.photos.map((data: any) => data.url);
  }
}
