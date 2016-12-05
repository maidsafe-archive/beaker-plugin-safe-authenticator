import React, { Component, PropTypes } from 'react';

export default class ListItem extends Component {
  static propTypes = {
    data: PropTypes.shape({
      name: PropTypes.string,
      vendor: PropTypes.string
    })
  };

  componentDidMount() {
    this.listItem.onclick = (e) => {
      e.preventDefault();
      const toggleClassName = 'expand';
      if (this.listItem.classList.contains(toggleClassName)) {
        return this.listItem.classList.remove(toggleClassName);
      }
      return this.listItem.classList.add(toggleClassName);
    };
  }

  render() {
    return (
      <div
        className="app-list-i"
        ref={(c) => {
          this.listItem = c;
        }}
      >
        <div className="icn">
          <span>{this.props.data.name[0]}</span>
        </div>
        <div className="ctn">
          <div className="i-cnt">
            <div className="title">
              <span>{this.props.data.name}</span>
            </div>
            <div className="vendor">
              <span>{this.props.data.vendor}</span>
            </div>
          </div>
          <div className="app-list-detail">
            <div className="permission">
              <span className="permission-h">Permissions</span>
              <ul>
                <li>
                  <span className="permission-icn safe-drive">{''}</span>
                  <span className="permission-title">SAFE DRIVE Permission</span>
                </li>
                <li>
                  <span className="permission-icn low-level-api">{''}</span>
                  <span className="permission-title">LOW LEVEL API Permission</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="opts">
          <div className="opt">
            <button type="button" className="btn">Revoke</button>
          </div>
        </div>
      </div>
    );
  }
}
