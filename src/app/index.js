import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import App from './app';
import '../../node_modules/opensans-npm-webfont/style.scss';
import './sass/main.scss';

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('safe-auth-home')
);
