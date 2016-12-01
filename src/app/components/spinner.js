import React, { Component, PropTypes } from 'react';

export default class Spinner extends Component {
  static propTypes = {
    show: PropTypes.bool.isRequired
  };

  render() {
    if (!this.props.show) {
      return <span>{' '}</span>;
    }
    return (
      <div className="overlay">
        <div className="spinner">
          <div className="spinner-cntr"><span className="spinner-i">{' '}</span></div>
        </div>
      </div>
    );
  }
}
