declare module '*.json' {
  const value: any;
  export default value;
}

declare interface Environment {
  production: boolean;
  serverConfig: string;
  browserConfig: string;
  VERSION: string;
  env?: string;
  name?: string;
  domain?: string;
  mainDomain?: string;
  capi?: {
    host: string;
    default_api_version: string;
  };
  stripe?: {
    URL: string;
    code: string;
    intent: string;
    usage: 'on_session' | 'off_session';
  };
  analytics?: {
    active: boolean;
    gtm: string;
    gtm_auth?: string;
    gtm_preview?: string;
  };
  session?: {
    key: string;
    hoursDuration: number;
  };
  storage?: {
    version: number;
    versionClean: number;
  };
  lokalise?: {
    uri: string;
  };
  loggly?: {
    active: boolean;
    logglyKey: string;
    sendConsoleErrors: boolean;
    tag: string;
  };
  google?: {
    src: string;
    client_id: string;
  };
  facebook?: {
    src: any;
    sharerUrl: string;
    debug: string;
    appId: string;
    version: string;
  };
  twitter?: {
    sharerUrl: string;
  };
  mail?: {
    sharerUrl: string;
  };
  geo?: {
    ipapi: {
      url: string;
    };
  };
  hotjar?: {
    routes: string[];
    active: boolean;
    exactRoute: boolean;
    url: string;
    id: string;
    sv: string;
  };
  simpleMDE?: {
    url: string;
  };
  tapi?: {
    library: string;
    name: string;
    active: boolean;
  };
  logRocket?: {
    active: boolean;
    apiKey: string;
  };
  firebase?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    fetchTimeoutMillis: number;
    minimumFetchIntervalMillis: number;
  };
  papi?: {
    host: string;
    default_api_version: string;
  };
  catapi?: {
    host: string;
    default_api_version: string;
  };
  openIncident?: {
    typeformCode: string;
  };
  f2b?: {
    host: string;
    default_api_version: string;
  };
  klarna?: {
    client_id: string;
    src: string;
  };
}

declare namespace Express {
  export interface Request {
    apiGateway?: any;
    logger?: any;
    sendResponse?: any;
    setTimeLimit?: any;
    clearTimeLimit?: any;
    _parsedUrl?: any;
  }
}
