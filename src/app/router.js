import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { checkAuthorised } from './utils';
import App from './containers/app';
import Login from './containers/login_container';
import CreateAccount from './containers/create_account_container';
import Home from './containers/app_list_container';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Home} onEnter={checkAuthorised} />
    <Route path="/login" component={Login} />
    <Route path="/create-account" component={CreateAccount} />
  </Route>
);
