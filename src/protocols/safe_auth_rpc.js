/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */
import { ipcMain, shell } from 'electron';
/* eslint-enable import/extensions */
import i18n from 'i18n';
import config from '../config';

config.i18n();

let clientManager = null;

const reqQueue = [];

let isReqProcessing = false;

const parseResUrl = (url) => {
  const split = url.split(':');
  split[0] = split[0].toLocaleLowerCase().replace('==', '');
  return split.join(':');
};

const openExternal = (uri) => {
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
  clientManager.decryptRequest(reqQueue[0]);
};

const reqQueueProcessNext = () => {
  isReqProcessing = false;
  reqQueue.shift();
  processReqQueue();
};

const registerAuthDecision = (event, authData, isAllowed) => {
  if (!authData) {
    return Promise.reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('URL'))));
  }

  if (typeof isAllowed !== 'boolean') {
    return Promise.reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('IsAllowed'))));
  }

  clientManager.authDecision(authData, isAllowed)
    .then((res) => {
      setTimeout(() => {
        reqQueueProcessNext();
        event.sender.send('onAuthDecisionRes', res);
      }, 1000);
      openExternal(res);
    })
    .catch((err) => {
      reqQueueProcessNext();
      event.sender.send('onAuthDecisionRes', err);
      console.error('Auth decision error :: ', err.message);
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
      setTimeout(() => {
        reqQueueProcessNext();
        event.sender.send('onContDecisionRes', res);
      }, 1000);
      openExternal(res);
    })
    .catch((err) => {
      reqQueueProcessNext();
      event.sender.send('onContDecisionRes', err);
      console.error('Container decision error :: ', err.message);
    });
};

const decryptRequest = (event, req) => {
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

const registerOnReqError = () => {
  clientManager.setReqErrorListener((error) => {
    reqQueueProcessNext();
    openExternal(error);
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

const register = (client) => {
  clientManager = client;
  registerOnReqError();
};

export default register;
