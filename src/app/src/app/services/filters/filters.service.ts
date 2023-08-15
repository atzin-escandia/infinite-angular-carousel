import {Injectable, Injector} from '@angular/core';
import {Subject, Observable} from 'rxjs';

import {BaseService} from '../base';

@Injectable({
  providedIn: 'root'
})
export class FiltersService extends BaseService {
  private resetFilters = new Subject<boolean>();

  constructor(
    public injector: Injector,
  ) {
    super(injector);
  }

  // Mandatory implementation
  public init(): void {
    this.resetFilters.next(false);
  }

  public getResetFilters(): Observable<boolean> {
    return this.resetFilters.asObservable();
  }

  public emitResetFilters(): void {
    this.resetFilters.next(true);
  }
}
