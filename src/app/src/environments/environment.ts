import * as pckES5 from '../../package.json';
const packageData: any = pckES5;

// El resto de información en assets/config en json
export const environment: Environment = {
  VERSION: typeof packageData.version !== 'undefined' ? packageData.version : packageData.default.version,
  production: false,
  serverConfig: '/../browser/assets/config/env.json',
  browserConfig: '/assets/config/env.json',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error'; // Included with Angular CLI.

