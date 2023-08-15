import {Injectable, ErrorHandler} from '@angular/core';
import {LoggerService} from '../logger';
import {environment} from '../../../environments/environment';
import {LogglyService} from 'ngx-loggly-logger';

@Injectable({
  providedIn: 'root'
})
export class ErrorService implements ErrorHandler {
  constructor(private loggerSrv: LoggerService, private logglySrv: LogglyService) {}

  handleError(error: any): void {
    if (environment.production && this.loggerSrv.active) {
      try {
        this.logglySrv.push({
          level: 'error',
          message: error.toString(),
          timestamp: new Date().getTime(),
          ...this.loggerSrv.fecthParams()
        });
      } catch (err) {
        console.error('error trying to handleError');
      }
    } else {
      console.error(error);
    }
  }
}
