import React, { Component, PropTypes } from 'react';
import { Translate } from 'react-redux-i18n';

export default class Alert extends Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    onClick: PropTypes.func
  };

  render() {
    if (!this.props.show) {
      return <span>{' '}</span>;
    }

    return (
      <div className="overlay">
        <div className="alert">
          <div className="alert-cntr">
            <div className="alert-b">
              <div className="head">{this.props.title}</div>
              <div className="content">{this.props.message}</div>
              <div className="foot">
                <button className="btn" onClick={() => this.props.onClick(1)}><Translate value="Ok" /></button>
                <button className="btn" onClick={() => this.props.onClick(0)}><Translate value="Cancel" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
