import { Injectable, Injector } from '@angular/core';
import { BaseService } from '../base';
import { StorageService } from '../storage';
import { ConfigService } from '../config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrowdfarmerFeedbackResource } from '../../resources/crowdfarmer-feedback';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CrowdfarmerFeedbackService extends BaseService {

  constructor(
    public injector: Injector,
    private http: HttpClient,
    public storageSrv: StorageService,
    public configSrv: ConfigService,
    private crowdfarmerFeedbackRsc: CrowdfarmerFeedbackResource
    ) {
      super(injector);
    }

  // Mandatory implementation
  public init: any = () => null;

  getFormContent(rating: string): Observable<any> {
    return this.http.get(`${environment.domain}/assets/formFeedback_${rating}.json`);
  }

  async sendFormInfo(formData: any): Promise<any> {
    await this.crowdfarmerFeedbackRsc.sendFormInfo(formData);
  }

}
