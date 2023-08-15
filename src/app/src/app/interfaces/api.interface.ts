import {HttpHeaders} from '@angular/common/http';

export interface ApiInterface {
  errors?: {
    code: number;
    msg?: any;
  };
  body?: {
    code: number;
    data: any;
  };
  headers: HttpHeaders;
  ok: boolean;
  status: number;
  statusText: string;
  type: number;
  url: string;
}
