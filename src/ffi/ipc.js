/* eslint-disable no-underscore-dangle */
import { ipcMain, shell } from 'electron';
import i18n from 'i18n';

import authenticator from './authenticator';
import CONSTANTS from '../constants';
import config from '../config';

config.i18n();

let ipcEvent = null;

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
    this.id = req.id;
    this.uri = req.uri;
    this.isUnRegistered = req.isUnRegistered;
    this.type = CONSTANTS.CLIENT_TYPES[req.type];
    this.error = null;
    this.res = null;
  }
}

class ReqQueue {
  constructor(resChannelName, errChannelName) {
    this.q = [];
    this.preocessing = false;
    this.req = null;
    this.resChannelName = resChannelName;
    this.errChannelName = errChannelName;
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
      this.req.res = res;
      if (ipcEvent) {
        ipcEvent.sender.send(self.resChannelName, self.req);
      }
      openExternal(res);
      self.next();
    }).catch((err) => {
      // FIXME: if error occurs for unregistered client process next
      self.req.error = err.message;
      ipcEvent.sender.send(self.errChannelName, self.req);
    });
  }
}

const reqQ = new ReqQueue('onAuthDecisionRes', 'onAuthResError');
const unregisteredReqQ = new ReqQueue('onUnAuthDecisionRes', 'onUnAuthResError');

const registerNetworkListener = (e) => {
  authenticator.setListener(CONSTANTS.LISTENER_TYPES.NW_STATE_CHANGE, (err, state) => {
    if (state === CONSTANTS.NETWORK_STATUS.CONNECTED) {
      reqQ.preocessing = false;
      reqQ.process();
    }
    e.sender.send('onNetworkStatus', state);
  });
};

const decodeRequest = (e, req, type) => {

  console.log("decoooodinngggg");
  console.log("decoooodinngggg",  e, req, type);
  const isWebReq = (type === CONSTANTS.CLIENT_TYPES.WEB);
  const isUnRegistered = req.isUnRegistered;
  const request = new Request({
    id: req.id,
    uri: isWebReq ? req.uri : req,
    type,
    isUnRegistered
  });

  ipcEvent = e;
  if (isUnRegistered) {
    unregisteredReqQ.add(request);
  } else {
    reqQ.add(request);
  }
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

const onSharedMDataReq = (e) => {
  authenticator.setListener(CONSTANTS.LISTENER_TYPES.MDATA_REQ, (err, req) => {
    e.sender.send('onSharedMDataReq', req);
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
      reqQ.req.res = res;
      e.sender.send('onAuthDecisionRes', reqQ.req);
      openExternal(res);
      reqQ.next();
    })
    .catch((err) => {
      reqQ.req.error = err;
      e.sender.send('onAuthDecisionRes', reqQ.req);
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
      reqQ.req.res = res;
      e.sender.send('onContDecisionRes', reqQ.req);
      openExternal(res);
      reqQ.next();
    })
    .catch((err) => {
      reqQ.req.error = err;
      e.sender.send('onContDecisionRes', reqQ.req);
      console.error('Container decision error :: ', err.message);
      reqQ.next();
    });
};

const onSharedMDataDecision = (e, data, isAllowed) => {
  if (!data) {
    return Promise.reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('URL'))));
  }

  if (typeof isAllowed !== 'boolean') {
    return Promise.reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('IsAllowed'))));
  }

  authenticator.encodeMDataResp(data, isAllowed)
    .then((res) => {
      reqQ.req.res = res;
      e.sender.send('onSharedMDataRes', reqQ.req);
      openExternal(res);
      reqQ.next();
    })
    .catch((err) => {
      reqQ.req.error = err;
      e.sender.send('onSharedMDataRes', reqQ.req);
      reqQ.next();
    });
};

const onReqError = (e) => {
  authenticator.setListener(CONSTANTS.LISTENER_TYPES.REQUEST_ERR, (err) => {
    reqQ.req.error = err;
    e.sender.send('onAuthResError', reqQ.req);
    reqQ.next();
  });
};

const skipAuthReq = () => {
  reqQ.next();
};

const init = () => {
  if (!ipcMain) {
    return;
  }
  ipcMain.on('registerSafeNetworkListener', registerNetworkListener);
  ipcMain.on('decryptRequest', decodeRequest);
  ipcMain.on('registerOnAuthReq', onAuthReq);
  ipcMain.on('registerOnContainerReq', onContainerReq);
  ipcMain.on('registerOnSharedMDataReq', onSharedMDataReq);
  ipcMain.on('registerAuthDecision', onAuthDecision);
  ipcMain.on('registerContainerDecision', onContainerDecision);
  ipcMain.on('registerSharedMDataDecision', onSharedMDataDecision);
  ipcMain.on('registerOnReqError', onReqError);
  ipcMain.on('skipAuthRequest', skipAuthReq);
};

export default init;
