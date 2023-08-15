import * as pckES5 from '../../package.json';
const packageData: any = pckES5;

// El resto de información en assets/config en json
export const environment: Environment = {
  VERSION: typeof packageData.version !== 'undefined' ? packageData.version : packageData.default.version,
  production: true,
  serverConfig: '/../browser/assets/config/env.json',
  browserConfig: '/assets/config/env.json',
};

import 'zone.js/dist/zone-error';
