import { makeStateKey, StateKey, TransferState } from '@angular/platform-browser';
import { Inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { environment } from '../../../environments/environment';

export type Serializable<T> = T | boolean | number | string | null | any;

@Injectable({
  providedIn: 'root',
})
export class TransferStateService {
  /**
   * The state keys.
   */
  private keys = new Map<string, StateKey<any>>();

  constructor(@Inject(PLATFORM_ID) private readonly platformId: InjectionToken<any>, private readonly transferState: TransferState) {}

  get<T>(key: string, defaultValue?: T | null, converter?: TransferStateConverter<T>): T | null {
    if (!this.has(key)) {
      return defaultValue || null;
    }
    const value = this.transferState.get<T>(this.getStateKey(key), defaultValue);

    return converter ? converter.fromTransferState(value) : value;
  }

  has(key: string): boolean {
    return this.transferState.hasKey(this.getStateKey(key));
  }

  set<T>(key: string, value: T, converter?: TransferStateConverter<T>): void {
    if (isPlatformServer(this.platformId)) {
      if (this.has(key)) {
        console.warn(`Setting existing value into TransferState using key: '${key}'`);
      }
      if (!environment.production) {
        console.log(`Storing TransferState for: '${key}'`);
      }
    }
    this.transferState.set(this.getStateKey(key), converter ? converter.toTransferState(value) : value);
  }

  private getStateKey<t>(key: string): StateKey<t> {
    if (this.keys.has(key)) {
      return this.keys.get(key);
    }
    this.keys.set(key, makeStateKey(key));

    return this.keys.get(key);
  }
}

export abstract class TransferStateConverter<T> {
  abstract fromTransferState(data: Serializable<T>): T;
  abstract toTransferState(data: T): Serializable<T>;
}
