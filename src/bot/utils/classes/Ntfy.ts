/**
 *! THIS FILE IS A DESCARATE COPY OF THE ORIGINAL NTFY NPM PACKAGE.
 ** I just touched it a bit and included on this folder because the way it was on npm gave a lot of problems
 ** with this project. It had to be node16 module, so it gave a lot of problems.
 ** I decided to manually import it here so it would give no problems, and well its already very lightweight.
 ** You can check the original at: https://www.npmjs.com/package/ntfy
 */

import { URL } from 'node:url';
import { promises as fs } from 'node:fs';
import axios, { AxiosBasicCredentials, AxiosHeaders, AxiosRequestConfig } from 'axios';
import { AttachmentConfig, BaseConfig, BroadcastAction, Config, HTTPAction, MessageConfig, ResponseData, ViewAction } from '../types/Ntfy';
import path from 'node:path';

export * from '../types/Ntfy';

const {
  NTFY_HOST: defaultServerURL,
  NTFY_USER,
  NTFY_PASS
} = process.env

const defaultAuth: AxiosBasicCredentials = {
  username: NTFY_USER!,
  password: NTFY_PASS!
}

export class NtfyClient {

  private readonly config?;
  constructor(config?: Partial<BaseConfig>) {
    this.config = config;
  }
  publish<T extends Config>(config: T): Promise<ResponseData<T>> {
    return publish({
      server: defaultServerURL!,
      authorization: defaultAuth,
      ...this.config,
      ...config,
    });
  }
}
function buildBroadcastActionString(action: BroadcastAction) {
  let str = `${action.type}, ${action.label}`;
  if (action.clear) {
    str += ', clear=true';
  }
  if (action.extras && Object.keys(action.extras).length) {
    str += `, ${Object.entries(action.extras)
      .map(([key, value]) => `extras.${key}=${value}`)
      .join(', ')}`;
  }
  if (action.intent) {
    str += `, intent=${action.intent}`;
  }
  return str;
}
function ConfigHasAttachment(config: Config): config is AttachmentConfig {
  return !!(config as AttachmentConfig).fileAttachment;
}
function ConfigHasMessage(config: Config): config is MessageConfig {
  return !!(config as MessageConfig).message;
}
function buildHTTPActionString(action: HTTPAction) {
  let str = `${action.type}, ${action.label}, ${action.url}`;
  if (action.method) {
    str += `, method=${action.method.toUpperCase()}`;
  }
  if (action.clear) {
    str += ', clear=true';
  }
  if (action.headers && Object.keys(action.headers).length) {
    str += `, ${Object.entries(action.headers)
      .map(([key, value]) => `headers.${key}=${value}`)
      .join(', ')}`;
  }
  if (action.body) {
    str += `, ${action.body}`;
  }
  return str;
}
function buildViewActionString(action: ViewAction) {
  let str = `${action.type}, ${action.label}, ${action.url}`;
  if (action.clear) {
    str += ', clear=true';
  }
  return str;
}


export async function publish(config: Config) {
  const axiosConfig: AxiosRequestConfig = { headers: new AxiosHeaders() };
  const headers = axiosConfig.headers as AxiosHeaders;
  let postData;
  if (config.actions && config.actions.length) {
    headers.set('X-Actions', config.actions
      .map(action => {
        switch (action.type) {
          case 'broadcast': {
            return buildBroadcastActionString(action as BroadcastAction);
          }
          case 'http': {
            return buildHTTPActionString(action as HTTPAction);
          }
          case 'view': {
            return buildViewActionString(action as ViewAction);
          }
          default: {
            return '';
          }
        }
      })
      .join('; '));
  }
  if (config.authorization) {
    axiosConfig.withCredentials = true;
    axiosConfig.auth = config.authorization;
  }
  if (config.delay) {
    headers.set('X-Delay', config.delay);
  }
  if (config.disableCache) {
    headers.set('X-Cache', 'no');
  }
  if (config.disableFirebase) {
    headers.set('X-Firebase', 'no');
  }
  if (config.emailAddress) {
    headers.set('X-Email', config.emailAddress);
  }
  if (ConfigHasMessage(config) && config.fileURL) {
    if (typeof config.fileURL === 'string') {
      headers.set('X-Attach', config.fileURL);
      headers.set('X-Filename', path.basename(config.fileURL));
    }
    else {
      headers.set('X-Attach', config.fileURL.url);
      headers.set('X-Filename', config.fileURL.filename);
    }
  }
  if (ConfigHasAttachment(config)) {
    try {
      postData = await fs.readFile(config.fileAttachment);
    }
    catch (error: any) {
      console.error('Error while reading file:', error.message);
    }
  }
  else if (ConfigHasMessage(config)) {
    postData = config.message;
  }
  else {
    throw new Error('No message or file attachment specified');
  }
  if (config.iconURL) {
    headers.set('X-Icon', config.iconURL);
  }
  if (config.priority) {
    headers.set('X-Priority', config.priority);
  }
  if (config.tags && config.tags.length) {
    headers.set('X-Tags', typeof config.tags === 'string' ? config.tags : config.tags.join(','));
  }
  if (config.title) {
    headers.set('X-Title', config.title);
  }
  const url = new URL(config.topic, config.server || defaultServerURL);
  const { data } = await axios.post(url.href, postData, axiosConfig);
  return data;
}
