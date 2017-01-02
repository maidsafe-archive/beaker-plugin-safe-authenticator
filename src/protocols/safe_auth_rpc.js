/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */
import { shell, ipcMain } from 'electron';
/* eslint-enable import/extensions */
import i18n from 'i18n';

let clientManager = null;

const authQueue = [];
let isAuthProcessing = false;

const processAuthQueue = () => {
  if (isAuthProcessing || authQueue.length === 0) {
    return;
  }

  if (!clientManager.getAuthenticatorHandle()) {
    return;
  }

  isAuthProcessing = true;
  const result = authQueue.shift();
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
        isAuthProcessing = false;
        processAuthQueue();
        event.sender.send('onAuthDecisionRes', res);
      }, 5000);
      shell.openExternal(res);
    })
    .catch((err) => {
      console.error(err);
    });
};

const decryptRequest = (event, req) => {
  authQueue.push(req);
  processAuthQueue();
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
      processAuthQueue();
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

const register = (client) => {
  clientManager = client;
};

export default register;
