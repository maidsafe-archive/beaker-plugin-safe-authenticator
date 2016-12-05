import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { I18n } from 'react-redux-i18n';
import configureStore from './store';
import routes from './router';
import CONSTANTS from './constants.json';
import './sass/main.scss';

import {
  setNetworkConnected,
  setNetworkConnecting,
  setNetworkDisconnected
} from './actions/network_state';

const store = configureStore();
const history = syncHistoryWithStore(hashHistory, store);

// set network listener
if (window.safeAuthenticator && window.safeAuthenticator.setNetworkListener) {
  window.safeAuthenticator.setNetworkListener((state) => {
    switch (state) {
      case CONSTANTS.NETWORK_STATUS.NETWORK_CONNECTING: {
        return store.dispatch(setNetworkConnecting());
      }
      case CONSTANTS.NETWORK_STATUS.NETWORK_CONNECTED: {
        return store.dispatch(setNetworkConnected());
      }
      case CONSTANTS.NETWORK_STATUS.NETWORK_DISCONNECTED: {
        return store.dispatch(setNetworkDisconnected());
      }
      default: {
        throw Error(I18n.t('UnknownNetworkState'));
      }
    }
  });
}

render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>,
  document.getElementById('safe-auth-home')
);
