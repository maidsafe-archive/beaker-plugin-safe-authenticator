import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import CONSTANTS from '../../constants';

export default class Spinner extends Component {
  static propTypes = {
    status: PropTypes.number.isRequired,
    reconnect: PropTypes.func
  };

  render() {
    let message = null;
    switch (this.props.status) {
      case CONSTANTS.NETWORK_STATUS.CONNECTED: {
        message = 'Connected';
        break;
      }
      case CONSTANTS.NETWORK_STATUS.DISCONNECTED: {
        message = 'Terminated';
        break;
      }
      case CONSTANTS.NETWORK_STATUS.CONNECTING: {
        message = 'Connecting';
        break;
      }
      default: {
        message = '';
        break;
      }
    }
    return (
      <div className="nw-status">
        <button
          className={classNames(
            'nw-status-i',
            {
              connecting: this.props.status === CONSTANTS.NETWORK_STATUS.CONNECTING,
              terminated: this.props.status === CONSTANTS.NETWORK_STATUS.DISCONNECTED,
              connected: this.props.status === CONSTANTS.NETWORK_STATUS.CONNECTED
            }
          )}
          onClick={() => {
            if (this.props.status !== CONSTANTS.NETWORK_STATUS.DISCONNECTED) {
              return;
            }
            this.props.reconnect();
          }}
        >{' '}</button>
        <span className="nw-status-tooltip">{message}</span>
      </div>
    );
  }
}
