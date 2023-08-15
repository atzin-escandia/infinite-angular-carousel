import {Injectable} from '@angular/core';

import {ApiResource} from '../api';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseResource {
  constructor(public apiRsc: ApiResource) { }
}
