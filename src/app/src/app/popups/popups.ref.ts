import {Observable, Subject} from 'rxjs';

export class PopupsRef {
  private readonly afterClosed = new Subject<any>();
  onClose: Observable<any> = this.afterClosed.asObservable();

  public dismiss(result?: any): void {
    this.afterClosed.next(result);
  }
}
