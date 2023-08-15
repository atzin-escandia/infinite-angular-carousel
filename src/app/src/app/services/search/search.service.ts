import { Injectable, Injector } from '@angular/core';
import { BaseService } from '@services/base/base.service';
import { SearchResource } from '@resources/search/search.resource';
import { Observable, Subject } from 'rxjs';
import { CountryService } from '@services/country';
import { RouterService } from '@app/services';

@Injectable({
  providedIn: 'root'
})
export class SearchService extends BaseService {

  private searchResults = new Subject<any>();

  // Check if is market page to handle a different Search functionality
  public searchOpen = false;

  constructor(
    private searchRsc: SearchResource,
    public injector: Injector,
    private countrySrv: CountryService,
    public routerSrv: RouterService
  ) {
    super(injector);
  }

  public emitSearch(results: any): void {
    this.searchResults.next(results);
  }

  /**
   * Return searchResults observable
   */
   public getResults(): Observable<any> {
    return this.searchResults.asObservable();
  }

  /**
   * Retrieve syn based on user type
   */
  public async predictive(search: string): Promise<any> {
    // Get current lang
    const lang = this.langService.getCurrentLang();

    // Build service params
    const params = {
      lang,
      search,
    };

    try {
      const results = await this.searchRsc.predictive(params);

      return results || [];
    } catch (error) {
      // Just catch
      return [];
    }
  }

  /**
   * Retrieve syn based on user type
   */
  public async search(search: string): Promise<any> {
    // Get current lang
    const lang = this.langService.getCurrentLang();
    const country = this.countrySrv.getCountry();

    // Build service params
    const params = {
      lang,
      search,
      country
    };

    try {
      let results = await this.searchRsc.search(params);

      if (results) {
        results = this.modelize(results);

        return results;
      }

      return [];
    } catch (error) {
      // Just catch
      return [];
    }
  }

  /**
   * Check if show the search tool or no
   */
  public showSearchTool(): boolean {
    return this.searchOpen;
  }
}
