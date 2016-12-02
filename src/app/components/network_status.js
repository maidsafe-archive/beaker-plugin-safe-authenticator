import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class Spinner extends Component {
  static propTypes = {
    status: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired
  };

  render() {
    return (
      <div className="nw-status">
        <span
          className={classNames(
            'nw-status-i',
            {
              connecting: this.props.status === 0,
              connected: this.props.status === 1,
              error: this.props.status === 2,
            }
          )}
        >{' '}</span>
        <span className="nw-status-tooltip">{this.props.message}</span>
      </div>
    );
  }
}
