import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CG_SECTIONS } from '../crowdgiving.constants';
import { ICGCart } from '../interfaces/cart.interface';

@Injectable()
export class CrowdgivingStoreService {
  readonly sections = CG_SECTIONS;

  get sectionQuery(): string {
    return this.activatedRoute.snapshot.queryParams.section;
  }

  private readonly _currentSectionIdx$ = new BehaviorSubject<number>(0);
  readonly currentSectionIdx$ = this._currentSectionIdx$.asObservable();
  get currentSectionIdx(): number {
    return this._currentSectionIdx$.getValue();
  }

  private readonly _cart$ = new BehaviorSubject<ICGCart[]>([]);
  readonly cart$ = this._cart$.asObservable();
  get cart(): ICGCart[] {
    return this._cart$.getValue();
  }

  constructor(private activatedRoute: ActivatedRoute) {}

  setCurrentSectionIdx(val: number): void {
    this._currentSectionIdx$.next(val);
  }

  setCart(val: ICGCart[]): void {
    this._cart$.next(val);
  }
}
