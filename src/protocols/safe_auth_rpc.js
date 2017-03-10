/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */
import { ipcMain, shell } from 'electron';
/* eslint-enable import/extensions */
import i18n from 'i18n';
import config from '../config';

config.i18n();
const CLIENT_TYPES = {
  DESKTOP: 'DESKTOP',
  WEB: 'WEB'
};

let clientManager = null;

const reqQueue = [];

let isReqProcessing = false;
let currentReqType = null;

const parseResUrl = (url) => {
  const split = url.split(':');
  split[0] = split[0].toLocaleLowerCase().replace('==', '');
  return split.join(':');
};

const openExternal = (uri) => {
  if (currentReqType !== CLIENT_TYPES.DESKTOP) {
    return;
  }
  try {
    shell.openExternal(parseResUrl(uri));
  } catch (err) { console.error(err); }
};

const processReqQueue = () => {
  if (isReqProcessing || reqQueue.length === 0) {
    return;
  }

  if (!clientManager.getAuthenticatorHandle()) {
    return;
  }

  isReqProcessing = true;
  const req = reqQueue[0];
  currentReqType = req.type;
  clientManager.decryptRequest(req.data);
};

const reqQueueProcessNext = () => {
  isReqProcessing = false;
  reqQueue.shift();
  processReqQueue();
};

const prepareResponse = (res) => ({ type: currentReqType, res });

const registerAuthDecision = (event, authData, isAllowed) => {
  if (!authData) {
    return Promise.reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('URL'))));
  }

  if (typeof isAllowed !== 'boolean') {
    return Promise.reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('IsAllowed'))));
  }

  clientManager.authDecision(authData, isAllowed)
    .then((res) => {
      event.sender.send('onAuthDecisionRes', prepareResponse(res));
      openExternal(res);
      reqQueueProcessNext();
    })
    .catch((err) => {
      event.sender.send('onAuthDecisionRes', prepareResponse(err));
      console.error('Auth decision error :: ', err.message);
      reqQueueProcessNext();
    });
};

const registerContainerDecision = (event, contData, isAllowed) => {
  if (!contData) {
    return Promise.reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('URL'))));
  }

  if (typeof isAllowed !== 'boolean') {
    return Promise.reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('IsAllowed'))));
  }

  clientManager.containerDecision(contData, isAllowed)
    .then((res) => {
      event.sender.send('onContDecisionRes', prepareResponse(res));
      openExternal(res);
      reqQueueProcessNext();
    })
    .catch((err) => {
      event.sender.send('onContDecisionRes', prepareResponse(err));
      console.error('Container decision error :: ', err.message);
      reqQueueProcessNext();
    });
};

const decryptRequest = (event, req) => {
  if (typeof req !== 'object' || !req.type || !req.data) {
    return console.error('Invalid request');
  }
  if (Object.keys(CLIENT_TYPES).indexOf(req.type) === -1) {
    return console.error('Invalid request client');
  }
  reqQueue.push(req);
  processReqQueue();
};

const registerOnAuthReq = (event) => {
  clientManager.setAuthReqListener((req) => {
    event.sender.send('onAuthReq', req);
  });
};

const registerOnContainerReq = (event) => {
  clientManager.setContainerReqListener((req) => {
    event.sender.send('onContainerReq', req);
  });
};

const registerOnReqError = (event) => {
  clientManager.setReqErrorListener((error) => {
    if (error.code === -203) { // handle app already authorised
      event.sender.send('onAuthDecisionRes', prepareResponse(error.msg));
    } else {
      event.sender.send('onAuthResError', prepareResponse(error.msg));
    }
    openExternal(error.msg);
    reqQueueProcessNext();
  });
};

const registerNetworkListener = (event) => {
  clientManager.setNetworkIpcListener((err, state) => {
    if (state === 1) {
      processReqQueue();
    }
    event.sender.send('onNetworkStatus', state);
  });
};

ipcMain.on('registerSafeNetworkListener', registerNetworkListener);
ipcMain.on('decryptRequest', decryptRequest);
ipcMain.on('registerOnAuthReq', registerOnAuthReq);
ipcMain.on('registerOnContainerReq', registerOnContainerReq);
ipcMain.on('registerAuthDecision', registerAuthDecision);
ipcMain.on('registerContainerDecision', registerContainerDecision);
ipcMain.on('registerOnReqError', registerOnReqError);

const register = (client) => {
  clientManager = client;
};

export default register;
