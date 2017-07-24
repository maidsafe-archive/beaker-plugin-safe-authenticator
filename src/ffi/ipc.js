/* eslint-disable no-underscore-dangle */
import { ipcMain, shell } from 'electron';
import i18n from 'i18n';

import authenticator from './authenticator';
import CONSTANTS from '../constants';
import config from '../config';
import winston from './winston-config';

config.i18n();

let decodeEvent = null;

const parseResUrl = (url) => {
  const split = url.split(':');
  split[0] = split[0].toLocaleLowerCase().replace('==', '');
  return split.join(':');
};

const openExternal = (uri) => {
  if (!uri || (uri.indexOf('safe') !== 0) || reqQ.req.type !== CONSTANTS.CLIENT_TYPES.DESKTOP) {
    return;
  }
  try {
    shell.openExternal(parseResUrl(uri));
  } catch (err) {
    console.error(err.message);
  }
};

class Request {
  constructor(req) {
    this.type = CONSTANTS.CLIENT_TYPES[req.type];
    this.uri = req.data;
  }
}

class Response {
  constructor(req, res) {
    this.type = req.type;
    this.res = res;
  }

  prepare() {
    return {
      type: this.type,
      res: this.res
    };
  }
}

class ReqQueue {
  constructor() {
    this.q = [];
    this.preocessing = false;
    this.req = null;
  }

  add(req) {
    if (!(req instanceof Request)) {
      this.next();
      return;
    }
    this.q.push(req);
    this.process();
  }

  next() {
    this.preocessing = false;
    if (this.q.length === 0) {
      return;
    }
    this.q.shift();
    this.process();
  }

  process() {
    const self = this;
    if (this.preocessing || this.q.length === 0) {
      return;
    }
    this.preocessing = true;
    this.req = this.q[0];
    authenticator.decodeRequest(this.req.uri).then((res) => {
      if (!res) {
        return;
      }
      if (decodeEvent) {
        decodeEvent.sender.send('onAuthDecisionRes', new Response(reqQ.req, res).prepare());
      }
      openExternal(res);
      self.next();
    }).catch((err) => {
      decodeEvent.sender.send('onAuthResError', new Response(reqQ.req, err.message).prepare());
    });
  }
}

const reqQ = new ReqQueue();

const registerNetworkListener = (e) => {
  authenticator.setListener(CONSTANTS.LISTENER_TYPES.NW_STATE_CHANGE, (err, state) => {
    if (state === CONSTANTS.NETWORK_STATUS.CONNECTED) {
      reqQ.preocessing = false;
      reqQ.process();
    }
    e.sender.send('onNetworkStatus', state);
  });
};

const decodeRequest = (e, data) => {
  const req = new Request(data);
  decodeEvent = e;
  reqQ.add(req);
};

const onAuthReq = (e) => {
  authenticator.setListener(CONSTANTS.LISTENER_TYPES.AUTH_REQ, (err, req) => {
    e.sender.send('onAuthReq', req);
  });
};

const onContainerReq = (e) => {
  authenticator.setListener(CONSTANTS.LISTENER_TYPES.CONTAINER_REQ, (err, req) => {
    e.sender.send('onContainerReq', req);
  });
};

const onAuthDecision = (e, authData, isAllowed) => {
  if (!authData) {
    return Promise.reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('URL'))));
  }

  if (typeof isAllowed !== 'boolean') {
    return Promise.reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('IsAllowed'))));
  }
  authenticator.encodeAuthResp(authData, isAllowed)
    .then((res) => {
      e.sender.send('onAuthDecisionRes', new Response(reqQ.req, res).prepare());
      openExternal(res);
      reqQ.next();
    })
    .catch((err) => {
      e.sender.send('onAuthDecisionRes', new Response(reqQ.req, err).prepare());
      console.error('Auth decision error :: ', err.message);
      reqQ.next();
    });
};

const onContainerDecision = (e, contData, isAllowed) => {
  if (!contData) {
    return Promise.reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('URL'))));
  }

  if (typeof isAllowed !== 'boolean') {
    return Promise.reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('IsAllowed'))));
  }

  authenticator.encodeContainersResp(contData, isAllowed)
    .then((res) => {
      e.sender.send('onContDecisionRes', new Response(reqQ.req, res).prepare());
      openExternal(res);
      reqQ.next();
    })
    .catch((err) => {
      e.sender.send('onContDecisionRes', new Response(reqQ.req, err).prepare());
      console.error('Container decision error :: ', err.message);
      reqQ.next();
    });
};

const onReqError = (e) => {
  authenticator.setListener(CONSTANTS.LISTENER_TYPES.REQUEST_ERR, (err) => {
    e.sender.send('onAuthResError', new Response(reqQ.req, err).prepare());
    openExternal(err.msg);
    reqQ.next();
  });
};

const skipAuthReq = () => {
  reqQ.next();
};

const init = () => {
  winston.info('beaker-plugin-safe-authenticator initialised...');
  if (!ipcMain) {
    return;
  }
  ipcMain.on('registerSafeNetworkListener', registerNetworkListener);
  ipcMain.on('decryptRequest', decodeRequest);
  ipcMain.on('registerOnAuthReq', onAuthReq);
  ipcMain.on('registerOnContainerReq', onContainerReq);
  ipcMain.on('registerAuthDecision', onAuthDecision);
  ipcMain.on('registerContainerDecision', onContainerDecision);
  ipcMain.on('registerOnReqError', onReqError);
  ipcMain.on('skipAuthRequest', skipAuthReq);
};

export default init;
