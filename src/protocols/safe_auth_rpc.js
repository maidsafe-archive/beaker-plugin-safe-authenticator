/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */
import { shell, ipcMain } from 'electron';
/* eslint-enable import/extensions */
import i18n from 'i18n';

let clientManager = null;

const reqQueue = [];
let isReqProcessing = false;

const processReqQueue = () => {
  if (isReqProcessing || reqQueue.length === 0) {
    return;
  }

  if (!clientManager.getAuthenticatorHandle()) {
    return;
  }

  isReqProcessing = true;
  const result = reqQueue.shift();
  clientManager.decryptRequest(result);
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
        isReqProcessing = false;
        processReqQueue();
        event.sender.send('onAuthDecisionRes', res);
      }, 5000);
      shell.openExternal(res);
    })
    .catch((err) => {
      console.error(err);
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
        isReqProcessing = false;
        processReqQueue();
        event.sender.send('onContDecisionRes', res);
      }, 5000);
      shell.openExternal(res);
    })
    .catch((err) => {
      console.error(err);
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

const registerOnReqError = (event) => {
  clientManager.setReqErrorListener((error) => {
    event.sender.send('onReqError', error);
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
ipcMain.on('registerOnReqError', registerOnReqError);
ipcMain.on('registerAuthDecision', registerAuthDecision);
ipcMain.on('registerContainerDecision', registerContainerDecision);

const register = (client) => {
  clientManager = client;
};

export default register;
