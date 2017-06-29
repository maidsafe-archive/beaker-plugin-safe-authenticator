import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

import NetworkStatus from './network_status';

export default class App extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    networkState: PropTypes.number,
    isAuthorised: PropTypes.bool,
    logout: PropTypes.func,
    setNetworkConnecting: PropTypes.func
  };

  constructor() {
    super();
    this.getHeaderOptions = this.getHeaderOptions.bind(this);
  }

  getHeaderOptions() {
    const { isAuthorised, logout } = this.props;
    if (!isAuthorised) {
      return null;
    }
    return (
      <div className="h-opt">
        <button
          type="button"
          className="logout"
          onClick={() => {
            logout();
          }}
        >Logout</button>
      </div>
    );
  }

  render() {
    const { networkState, isAuthorised, setNetworkConnecting } = this.props;
    const appLogoClassname = classNames(
      'h-app-logo',
      {
        'safe-auth-icon': !isAuthorised
      }
    );
    return (
      <div className="root">
        <header>
          <div className="h-app-name">{''}</div>
          <div className={appLogoClassname}>{ isAuthorised ?
            <NetworkStatus status={networkState} reconnect={setNetworkConnecting} /> : null }
          </div>
          {this.getHeaderOptions()}
        </header>
        <div className="base">
          <div className="card-main">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
