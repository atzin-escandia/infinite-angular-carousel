declare let google: any;
declare let window: any;

import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { accounts } from 'google-one-tap';
import { first } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UtilsService } from '../utils';
import { AuthResource } from '@app/resources';

@Injectable({
  providedIn: 'root'
})
export class GoogleService {
  private readonly _$isScriptLoaded = new BehaviorSubject<boolean>(false);
  readonly $isScriptLoaded = this._$isScriptLoaded.asObservable();
  get isScriptLoaded(): boolean {
    return this._$isScriptLoaded.getValue();
  }

  private readonly _$gToken = new BehaviorSubject<string>('');
  readonly $gToken = this._$gToken.asObservable();
  get gToken(): string {
    return this._$gToken.getValue();
  }

  private _gAccounts: accounts;

  constructor(
    private ngZone: NgZone,
    private utilsSrv: UtilsService,
    private authRsc: AuthResource,
  ) {}

  init(): void {
    this.utilsSrv.loadScript({ src: environment.google.src, defer: true, async: true, onload: this._loadSDK.bind(this) });
  }

  renderButton(id: string, width: number): void {
    this._$gToken.next('');

    if (this.isScriptLoaded) {
      this._renderButtonHandler(id, width);
    } else {
      this.$isScriptLoaded.pipe(first((res) => !!res)).subscribe(() => {
        this._renderButtonHandler(id, width);
      });
    }
  }

  launchPrompt(): void {
    this._$gToken.next('');

    if (this.isScriptLoaded) {
      this._launchPromptHandler();
    } else {
      this.$isScriptLoaded.pipe(first((res) => !!res)).subscribe(() => {
        this._launchPromptHandler();
      });
    }
  }

  async getGoogleUser(token: string): Promise<any> {
    return this.authRsc.getGoogleUser({token});
  }

  resetToken(): void {
    this._$gToken.next('');
  }

  private _loadSDK(): void {
    try {
      this._gAccounts = google.accounts;

      this._gAccounts.id.initialize({
        client_id: environment.google.client_id,
        ux_mode: 'popup',
        cancel_on_tap_outside: true,
        callback: ({credential}) => {
          this.ngZone.run(() => {
            this._handleCredential(credential);
          });
        },
      });

      this._$isScriptLoaded.next(true);
    } catch (err) {
      this._$isScriptLoaded.next(false);

      throw new Error('Error loading Google SDK');
    }
  }

  private _renderButtonHandler(id: string, width: number): void {
    this._gAccounts.id.renderButton(document.getElementById(id), {
      type: 'standard',
      size: 'large',
      ...(width && { width }),
    });
  }

  private _launchPromptHandler(): void {
    this._gAccounts.id.prompt();
  }

  private _handleCredential(token: string): void {
    this._$gToken.next(token);
  }
}
