import React, { Component, PropTypes } from 'react';
import { Translate } from 'react-redux-i18n';
import CONSTANTS from '../../constants.json';

export default class ListItem extends Component {
  static propTypes = {
    data: PropTypes.shape({
      name: PropTypes.string,
      vendor: PropTypes.string
    }),
    isDefault: PropTypes.bool,
    loading: PropTypes.bool,
    revokeApp: PropTypes.func
  };

  constructor() {
    super();
    this.toggleList = this.toggleList.bind(this);
  }

  /* eslint-disable class-methods-use-this */
  getPermission(permission) {
    /* eslint-enable class-methods-use-this */
    switch (permission) {
      case CONSTANTS.APP_DEFAULT_PERMISSIONS.SAFE_DRIVE_ACCESS: {
        return (
          <li>
            <span className="permission-icn safe-drive">{''}</span>
            <span className="permission-title"><Translate value="SAFE DRIVE Permission" /></span>
          </li>
        );
      }
      case CONSTANTS.APP_DEFAULT_PERMISSIONS.LOW_LEVEL_API: {
        return (
          <li>
            <span className="permission-icn low-level-api">{''}</span>
            <span className="permission-title"><Translate value="LOW LEVEL API Permission" /></span>
          </li>
        );
      }
      default: {
        return (
          <li>
            <span className="permission-icn low-level-api">{''}</span>
            <span className="permission-title"><Translate value="No permissions" /></span>
          </li>
        );
      }
    }
  }

  toggleList(e) {
    e.preventDefault();
    const toggleClassName = 'expand';
    if (this.listItem.classList.contains(toggleClassName)) {
      return this.listItem.classList.remove(toggleClassName);
    }
    return this.listItem.classList.add(toggleClassName);
  }

  render() {
    const { loading, isDefault, data, revokeApp } = this.props;

    if (loading) {
      return (
        <div className="app-list-i default"><Translate value="Fetching apps" />...</div>
      );
    }
    if (isDefault) {
      return (
        <div className="app-list-i default"><Translate value="No Apps Found" /></div>
      );
    }
    return (
      <div
        className="app-list-i"
        ref={(c) => {
          this.listItem = c;
        }}
        onClick={this.toggleList}
      >
        <div className="icn">
          <span>{data.name[0]}</span>
        </div>
        <div className="ctn">
          <div className="i-cnt">
            <div className="title">
              <span>{data.name}</span>
            </div>
            <div className="vendor">
              <span>{data.vendor}</span>
            </div>
          </div>
          <div className="app-list-detail">
            <div className="permission">
              <span className="permission-h"><Translate value="Permissions" /></span>
              <ul>
                { data.permissions ?
                  data.permissions.map((permission) => this.getPermission(permission)) :
                  this.getPermission()
                }
              </ul>
            </div>
          </div>
        </div>
        <div className="opts">
          <div className="opt">
            <button
              type="button"
              className="btn"
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                revokeApp(data.id);
              }}
            ><Translate value="Revoke Access" /></button>
          </div>
        </div>
      </div>
    );
  }
}
