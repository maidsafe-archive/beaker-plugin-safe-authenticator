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
    console.log(':: auth processing ::', isAuthProcessing, authQueue.length);
    return
  }

  if (!clientManager.isAutheticatorAuthorised()) {
    console.log(':: not authorised ::');
    return
  }

  if (!authReqEvent) {
    console.log(':: event not registered ::');
    return
  }

  isAuthProcessing = true;
  const result = authQueue.shift();
  console.log(':: auth data ::', result);
  authReqEvent.sender.send('onAuthReq', result);
};

const registerAuthDecision = (event, authData, isAllowed) => {
  console.log(':: auth desicion ::', authData, isAllowed);
  if (!authData) {
    return Promise.reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('URL'))));
  }

  if (typeof isAllowed !== 'boolean') {
    return Promise.reject(new Error(i18n.__('messages.should_not_be_empty', i18n.__('IsAllowed'))));
  }

  /* eslint-enable class-methods-use-this */
  clientManager.authDecision(authData[2], authData[3], isAllowed)
    .then((res) => {
      // shell.openExternal(res);
      setTimeout(function () {
        isAuthProcessing = false;
        processAuthQueue();
        console.log(':: Auth decison result :: ', res || authData);
        event.sender.send('onAuthDecisionRes', res || authData);
      }, 5000)
    });
};

const decryptRequest = (event, req) => {
  const parsedUrl = req.split('/');
  authQueue.push(parsedUrl);
  console.log('Decrypted request :: ', parsedUrl, authQueue);
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
    console.log('RPC Network status ::', status);
    event.sender.send('onNetworkStatus', status)
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
