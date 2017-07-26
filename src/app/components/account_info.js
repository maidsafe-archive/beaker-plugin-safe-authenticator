import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class AccountInfo extends Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    done: PropTypes.number.isRequired,
    available: PropTypes.number.isRequired,
    refresh: PropTypes.func.isRequired
  };

  render() {
    const { done, available, isLoading, refresh } = this.props;
    const total = done + available;
    const statusClassName = classNames(
      'acc-info-status',
      {
        safer: (done > 0 && done < 250),
        okay: (done > 250 && done < 400),
        danger: (done > 400),
      }
    );
    return (
      <div className="acc-info">
        <div className="acc-info-b">
          <div className={statusClassName}>
            <span className="label">Account Status:</span>
            <span className="val">{done || 0}/{total || 0}</span>
            <button
              type="button"
              className="refresh"
              disabled={isLoading}
              onClick={() => {
                refresh();
              }}
            >{''}</button>
            <div className="tooltip">Account is limited to the number of mutations permitted for an account</div>
          </div>
          <div className="timer"><span className="val">02:00</span></div>
        </div>
      </div>
    );
  }
}
