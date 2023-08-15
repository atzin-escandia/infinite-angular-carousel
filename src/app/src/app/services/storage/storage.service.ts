import {Injectable, Injector} from '@angular/core';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: any;
  private version: number;
  private versionClean: number;
  private LOGIN_KEY: string;
  private DEVICE_KEY = 'cf-device';
  private envType = (): string => (typeof window === 'object') ? 'browser' : 'server';

  constructor(public injector: Injector) {}

  /**
   * Init service
   */
  public init(): any {
    // Load storage version
    this.version = environment.storage?.version || null;
    this.versionClean = environment.storage?.versionClean || null;
    this.LOGIN_KEY = environment.session?.key || null;

    this.selectStorage();
    this.setDevice();
  }

  private getHash(): string {
    const uint32 = window.crypto?.getRandomValues(new Uint32Array(1))[0];

    return uint32?.toString(16) || '';
  }

  private setDevice(): void {
    if (this.envType() === 'browser') {
      const device = this.getDeviceId();

      if (!device) {
        const hash = `${this.getHash()}-${this.getHash()}-${this.getHash()}`;

        this.set(this.DEVICE_KEY, hash, 0, true);
      }
    }
  }

  public getDeviceId(): string {
    if (this.envType() === 'browser') {
      return this.get(this.DEVICE_KEY) || '';
    }

    return '';
  }

  /**
   * Set key and value in storage
   *
   * @param key
   * @param value
   * @param time miliseconds
   * @param versionLess
   * @param type
   */
  public set(key: string, value: any, time: number = 0, versionLess: boolean = false, type: number = 1): void {
    if (!this.storage) {
      this.init();
    }

    const params = {
      data: value,
      time: time > 0 ? new Date().getTime() + time * 1000 : time,
      version: versionLess ? 0 : this.version
    };

    if (type === 1) {
      this.storage.setItem(key, JSON.stringify(params));
    } else if (type === 2 && this.checkSessionStorage()) {
      sessionStorage.setItem(key, JSON.stringify(params));
    }
  }

  /**
   * Get value from key
   */
  public get(key: string, type: number = 1): any {
    if (!this.storage) {
      this.init();
    }

    let storedDagta;

    if (type === 1) {
      storedDagta = this.storage.getItem(key);
    } else if (type === 2 && this.checkSessionStorage()) {
      storedDagta = sessionStorage.getItem(key);
    }

    try {
      const parsedData = JSON.parse(storedDagta);
      const time = new Date().getTime();

      if (!parsedData) {
        return null;
      }
      if (parsedData?.time === 0 || (parsedData?.time >= time && (parsedData?.version === 0 || parsedData?.version === this.version))) {
        return parsedData.data;
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  public clearPrefix(prefix: string): void {
    if (prefix) {
      if (!this.storage) {
        this.init();
      }

      Object.entries(this.storage)
        .map(x => x[0])
        .filter(x => x.startsWith(prefix))
        .map(x => this.storage.removeItem(x));
    }
  }

  /**
   * Clear all storage or just one key
   */
  public clear(key?: string, type: number = 1): void {
    if (!this.storage) {
      this.init();
    }

    if (type === 1) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      key ? this.storage.removeItem(key) : this.storage.clear();
    } else if (type === 2) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      key ? sessionStorage.removeItem(key) : sessionStorage.clear();
    }
  }

  /**
   * Auto clean storage
   */
  private autoClean(): void {
    try {
      if (!this.storage) {
        this.init();
      }

      const cleanCache = this.storage.getItem('cleanCache');

      if (cleanCache === null || (parseInt(cleanCache) !== this.versionClean)) {
        // OLD
        this.storage.removeItem('logged');
        this.storage.removeItem('capi-token');
        this.storage.removeItem('userData');

        // new
        this.storage.removeItem(this.LOGIN_KEY);
        this.storage.removeItem('auto-login');
        this.storage.removeItem('lastPayment');
        for (const key in this.storage) {
          if (/^cache.*/g.test(key)) {
            this.storage.removeItem(key);
          }
        }
      }
      this.storage.setItem('cleanCache', this.versionClean);
    } catch (e) {
      console.error('Autoclean', e);
    }
  }

  private checkSessionStorage(): boolean {
    const testKey = 'testNameStorage';

    try {
      sessionStorage.setItem(testKey, '1');
      sessionStorage.removeItem(testKey);

      return true;
    } catch (error) {
      return false;
    }
  }

  public getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length >= 2) {
      return parts.pop().split(';').shift();
    }

    return null;
  }

  private deleteAllCookies(): void {
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  /**
   * Select a valid storage
   */
  private selectStorage(): any {
    const testKey = 'testNameStorage';

    try {
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);

      this.storage = localStorage;
      this.autoClean();
    } catch (error) {
      try {
        sessionStorage.setItem(testKey, '1');
        sessionStorage.removeItem(testKey);

        this.storage = sessionStorage;
        this.autoClean();
      } catch (error2) {
        // Fake sessionStorage in cookies for safari
        this.storage = {
          setItem: (name: string, value) => {
            if (typeof document !== 'undefined') {
              let b64Data = '';

              try {
                b64Data = btoa(value);
              } catch (error3) {
                return;
              }

              if (b64Data.length <= 4000) {
                document.cookie = name + '=' + b64Data + '; path=/; SameSite=Lax';
              }
            }
          },
          getItem: (name: string) => {
            if (typeof document !== 'undefined') {
              const nameEQ = name + '=';
              const ca = document.cookie.split(';');

              for (let c of ca) {
                while (c.charAt(0) === ' ') {
                  c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) === 0) {
                  return atob(c.substring(nameEQ.length, c.length));
                }
              }
            }

            return null;
          },
          removeItem: (_key) => { }
        };
      }
    }
  }

  /**
   * Métodos autenticación
   */
  public getCurrentUser(): any {
    return this.getCurrentLoginData()?.user || null;
  }

  public isLogged(): boolean {
    return !!(this.get(this.LOGIN_KEY));
  }

  public getCurrentLoginData(): any {
    return this.get(this.LOGIN_KEY);
  }
}
