import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import App from './app';
import 'opensans-npm-webfont';
import './sass/main.scss';

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('safe-auth-home')
);
