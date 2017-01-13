import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { I18n } from 'react-redux-i18n';
import configureStore from './store';
import routes from './router';
import CONSTANTS from '../constants.json';
import './sass/main.scss';

import {
  setNetworkConnected,
  setNetworkConnecting,
  setNetworkDisconnected
} from './actions/network_state';

import { setAppList } from './actions/app';

const store = configureStore();
const history = syncHistoryWithStore(hashHistory, store);

const registerNetworkStateListener = (cb) => {
  // set network listener
  if (window.safeAuthenticator && window.safeAuthenticator.setNetworkListener) {
    window.safeAuthenticator.setNetworkListener(cb);
  }
};

const networkStateListenerCb = (err, state) => {
  registerNetworkStateListener(networkStateListenerCb);
  switch (state) {
    case CONSTANTS.NETWORK_STATUS.CONNECTING: {
      return store.dispatch(setNetworkConnecting());
    }
    case CONSTANTS.NETWORK_STATUS.CONNECTED: {
      return store.dispatch(setNetworkConnected());
    }
    case CONSTANTS.NETWORK_STATUS.DISCONNECTED: {
      return store.dispatch(setNetworkDisconnected());
    }
    default: {
      throw Error(I18n.t('invalid_network_state'));
    }
  }
};

const registerAppListUpdateListener = (cb) => {
  if (window.safeAuthenticator && window.safeAuthenticator.setAppListUpdateListener) {
    window.safeAuthenticator.setAppListUpdateListener(cb);
  }
};

const appListUpdateListenerCb = (err, apps) => {
  registerAppListUpdateListener(appListUpdateListenerCb);
  return store.dispatch(setAppList(apps));
};

networkStateListenerCb(null, window.safeAuthenticator.getNetworkState());
appListUpdateListenerCb(null, []);

render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>,
  document.getElementById('safe-auth-home')
);
