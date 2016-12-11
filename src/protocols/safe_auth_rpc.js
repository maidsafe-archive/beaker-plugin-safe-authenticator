/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */
import { shell, ipcMain } from 'electron';
/* eslint-enable import/extensions */
import i18n from 'i18n';

let clientManager = null;

const authQueue = [];
let isAuthProcessing = false;
let authReqEvent = null;

const processAuthQueue = () => {
  if (isAuthProcessing || authQueue.length === 0) {
    return;
  }

  if (!clientManager.isAutheticatorAuthorised()) {
    return;
  }

  if (!authReqEvent) {
    return;
  }

  isAuthProcessing = true;
  const result = authQueue.shift();
  authReqEvent.sender.send('onAuthReq', result);
};

const registerAuthDecision = (event, authData, isAllowed) => {
  if (!authData) {
    return Promise.reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('URL'))));
  }

  if (typeof isAllowed !== 'boolean') {
    return Promise.reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('IsAllowed'))));
  }

  /* eslint-enable class-methods-use-this */
  clientManager.authDecision(authData[2], authData[3], isAllowed)
    .then((res) => {
      setTimeout(() => {
        isAuthProcessing = false;
        processAuthQueue();
        event.sender.send('onAuthDecisionRes', res || authData);
      }, 5000);
      shell.openExternal(res);
    })
    .catch((err) => {
      console.error(err);
    });
};

const decryptRequest = (event, req) => {
  const parsedUrl = req.split('/');
  authQueue.push(parsedUrl);
  processAuthQueue();
};

const registerOnAuthReq = (event) => {
  authReqEvent = event;
};

const registerOnContainerReq = (event) => {
  setTimeout(() => {
    event.sender.send('onContainerReq', {});
  }, 3000);
};

const registerNetworkListener = (event) => {
  clientManager.setNetworkIpcListener((err, status) => {
    if (status === 1) {
      processAuthQueue();
    }
    event.sender.send('onNetworkStatus', status);
  });
};

ipcMain.on('registerSafeNetworkListener', registerNetworkListener);
ipcMain.on('decryptRequest', decryptRequest);
ipcMain.on('registerOnAuthReq', registerOnAuthReq);
ipcMain.on('registerOnContainerReq', registerOnContainerReq);
ipcMain.on('registerAuthDecision', registerAuthDecision);

const register = (client) => {
  clientManager = client;
};

export default register;
