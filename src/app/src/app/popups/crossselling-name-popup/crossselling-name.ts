import {Component, OnInit} from '@angular/core';
import {PopupsInterface} from '../popups.interface';
import {PopupsRef} from '../popups.ref';
import {EventService, TextService} from '../../services';

@Component({
  selector: 'crossselling-name',
  templateUrl: './crossselling-name.html',
  styleUrls: ['./crossselling-name.scss']
})
export class CrosssellingNameComponent implements OnInit {
  public onClose: any;
  public products: any;
  public err = false;

  constructor(public config: PopupsInterface, public popup: PopupsRef, public eventSrv: EventService, public textSrv: TextService) { }

  ngOnInit(): void {
    if (this.config.data.products) {
      this.products = this.config.data.products;
    }
  }

  save(): void {
    this.err = false;
    const formRegex = new RegExp(
      // eslint-disable-next-line @typescript-eslint/quotes
      "^(?=.*[a-zA-Z0-9ÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÑÝÇàáâãäåèéêëìíîïòóôõöùúûüñýÿçß.,;'!?+&d_])" +
      // eslint-disable-next-line @typescript-eslint/quotes
      "([a-zA-Z0-9ÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÑÝÇàáâãäåèéêëìíîïòóôõöùúûüñýÿçß.,;'!?+&d_ -]+)$"
    );

    for (const product of this.products) {
      if (!product.name || product.name.length === 0) {
        product.errName = true;
        this.err = true;
        break;
      } else {
        product.errName = false;
      }

      if (!formRegex.test(product.name)) {
        this.err = true;
        product.errFormat = true;
        break;
      } else {
        product.errFormat = false;
      }
    }

    if (!this.err) {
      this.onClose(this.products);
    }
  }

  onAccept(): void {
    this.eventSrv.dispatchEvent('crossselling-name', false);

    this.onClose(null, () => {
      if (this.config.data.onClose) {
        this.config.data.onClose();
      }
    });
  }
}
