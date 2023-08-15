import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MediatorsService {

  private notAvailableShipmentCountrySub: Subject<boolean> = new Subject();
  private autocompleteHasMatches: Subject<boolean> = new Subject();

  public emitNotAvailableShipmentCountry(notAvailableShipmentCountry: boolean): void {
    this.notAvailableShipmentCountrySub.next(notAvailableShipmentCountry);
  }

  public subscribeNotAvailableShipmentCountry(): Observable<boolean> {
    return this.notAvailableShipmentCountrySub.asObservable();
  }

  public emitCountryAutocompleteMatch(hasMatches: boolean): void {
    this.autocompleteHasMatches.next(hasMatches);
  }

  public subscribeCountryAutocompleteMatch(): Observable<boolean> {
    return this.autocompleteHasMatches.asObservable();
  }

}
