import React, { Component, PropTypes } from 'react';
import { Translate } from 'react-redux-i18n';

export default class FieldStrength extends Component {
  static propTypes = {
    strength: PropTypes.number.isRequired
  };

  render() {
    return (
      <span
        className="strength"
        style={{ width: `${Math.min((this.props.strength / 16) * 100, 100)}%` }}>{''}</span>
    );
  }
}
