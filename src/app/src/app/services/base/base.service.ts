import { Injectable, Injector } from '@angular/core';
import { LangService } from '../lang';

@Injectable({
  providedIn: 'root',
})
export abstract class BaseService {
  constructor(public injector: Injector) {
    this.langService = this.injector.get(LangService);
  }

  public langService: LangService;

  init?(): void;

  /**
   * Modelize data to insert lang texts
   *
   * @param object
   * @param toDelete >> Keys to delete | Path to delete 'example.propertyInsideExample'
   * @param dataIsArr
   */
  public modelize(object: any, toDelete: any = [], dataIsArr: boolean = false): any {
    const lang = this.langService.getCurrentLang();
    const defaultLang = this.langService.getDefaultLang();

    for (const key in object) {
      if (object[key]) {
        if (key.startsWith('_m_')) {
          const newKey = key.replace('_m_', '');

          object.__defineGetter__(newKey, () => {
            if (object[key] && object[key][lang]) {
              return object[key][lang];
            }
            if (object[key] && object[key][defaultLang]) {
              return object[key][defaultLang];
            }

            return newKey;
          });
        } else if (typeof object[key] === 'object') {
          this.modelize(object[key]);
        } else if (Object.prototype.toString.call(object) === '[object Array]') {
          for (const item of object) {
            this.modelize(item);
          }
        }
      }
    }

    const deleteOrEnter = (objectInspected: any, key: string): void => {
      if (objectInspected[key]) {
        delete objectInspected[key];
      } else {
        const indexSlice = key.indexOf('.');
        const splittedPath = [key.slice(0, indexSlice), key.slice(indexSlice + 1)];

        if (indexSlice !== -1) {
          deleteOrEnter(objectInspected[splittedPath[0]], splittedPath[1]);
        }
      }
    };

    for (const key of toDelete) {
      if (dataIsArr) {
        object = object.map((dataFromArr: any): any => {
          deleteOrEnter(dataFromArr, key);

          return dataFromArr;
        });
      } else {
        deleteOrEnter(object, key);
      }
    }

    return object;
  }
}

export interface BaseService {
  get?(l: any, m: any, k: any, j: any);
  set?(l: any, m: any, k: any);
}
