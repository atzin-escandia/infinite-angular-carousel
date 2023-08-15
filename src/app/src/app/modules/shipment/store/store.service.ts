import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { IAddress } from '@app/interfaces';

@Injectable()
export class ShipmentStoreService {
  private readonly _userAddresses$ = new BehaviorSubject<IAddress[]>([]);
  readonly userAddresses$ = this._userAddresses$.asObservable();
  get userAddresses(): IAddress[] {
    return this._userAddresses$.getValue();
  }

  private readonly _selectedUserAddressId$ = new BehaviorSubject<string>(null);
  readonly selectedUserAddressId$ = this._selectedUserAddressId$.asObservable();
  get selectedUserAddressId(): string {
    return this._selectedUserAddressId$.getValue();
  }
  get selectedUserAddress$(): Observable<IAddress> {
    return this.selectedUserAddressId$.pipe(map((id) => this.getSelectedUserAddress(id)));
  }

  setUserAddresses(value: IAddress[]): void {
    this._userAddresses$.next(value);
  }

  updateUserAddress(id: string, value: IAddress): void {
    const index = this.userAddresses.findIndex((elem) => elem.id === id);
    const userAddresses = [...this.userAddresses];

    if (value.favourite) {
      userAddresses.map((elem) => (elem.favourite = false));
    }
    userAddresses[index] = { ...userAddresses[index], ...value };
    this._userAddresses$.next(userAddresses);
  }

  addUserAddress(value: IAddress): void {
    const userAddresses = [...this.userAddresses, value];

    this._userAddresses$.next(userAddresses);
  }

  getSelectedUserAddress(id?: string): IAddress {
    return this.userAddresses.find((elem) => elem.id === (id || this.selectedUserAddressId));
  }

  setSelectedUserAddressId(value: string): void {
    this._selectedUserAddressId$.next(value);
  }
}
