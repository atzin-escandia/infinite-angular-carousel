import {environment} from '../../environments/environment';

export const loadConfig = (): Environment => {
  const platform = envType();
  let env = {};

  if (platform === 'server') {
    env = loadSsrJson();
  } else {
    env = loadWebJson();
  }
  Object.assign(environment, env);

  return environment;
};

const envType = (): string => (typeof window === 'object') ? 'browser' : 'server';

const loadSsrJson = (): any => {
  const fs = require('fs');
  const path = __dirname + environment.serverConfig;
  const data = fs.readFileSync(path);

  return JSON.parse(data.toString('utf-8'));
};

const loadWebJson = (): any => {
  const xmlhttp = new XMLHttpRequest();

  xmlhttp.open('GET', environment.browserConfig, false);
  if (xmlhttp.overrideMimeType) {
    xmlhttp.overrideMimeType('application/json');
  }
  xmlhttp.send();
  if (xmlhttp.status === 200 && xmlhttp.readyState === 4) {
    return JSON.parse(xmlhttp.responseText);
  } else {
    throw new Error('Error loading config file');
  }
};

