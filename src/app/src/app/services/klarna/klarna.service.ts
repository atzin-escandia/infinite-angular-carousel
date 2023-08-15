import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KlarnaService {
  isLoaded: boolean;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  init(): void {
    if (!this.isLoaded) {
      this._loadScript(this._onload.bind(this));
    }
  }

  refreshPlacements(): void {
    try {
      (window as any)?.Klarna.OnsiteMessaging.refresh();
    } catch (err) {
      throw new Error('Error on refresh Klarna placements');
    }
  }

  private _onload(): void {
    this.isLoaded = (window as any)?.KlarnaOnsiteService?.loaded || false;
  }

  private _loadScript(onload: any): void {
    const script = this.document.createElement('script');

    script.type = 'text/javascript';
    script.src = environment.klarna?.src;
    script.async = true;

    script.setAttribute('data-client-id', environment.klarna?.client_id);

    script.onload = onload;

    const targetElement = this.document.getElementsByTagName('body')[0].getElementsByTagName('script')[0];

    targetElement.parentNode.insertBefore(script, targetElement.nextSibling);
  }
}
