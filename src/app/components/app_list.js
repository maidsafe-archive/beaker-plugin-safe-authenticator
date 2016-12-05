import React, { Component } from 'react';
import ListItem from './app_list_item';

export default class AppList extends Component {
  static propTypes = {};

  constructor() {
    super();
    this.appList = [{
      id: 1,
      name: 'Cookley',
      vendor: 'kpeters0'
    }, {
      id: 2,
      name: 'Overhold',
      vendor: 'jwallace1'
    }];

    this.setFixedHeader = this.setFixedHeader.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.setFixedHeader);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.setFixedHeader);
  }

  setFixedHeader() {
    return (window.scrollY > 10) ?
      this.titlebar.classList.add('fixed') : this.titlebar.classList.remove('fixed');
  }

  render() {
    return (
      <div className="card app-list">
        <div className="app-list-b">
          <div
            className="head"
            ref={(c) => {
              this.titlebar = c;
            }}
          >
            <h3 className="heading md">Authorised applications</h3>
          </div>
          <div className="app-list-cntr">
            <div className="title-bar">
              <div className="title-bar-b">
                <span>Name</span>
                <span>Vendor</span>
              </div>
            </div>
            <div className="app-list-i-b">
              {
                this.appList.map((item, i) => <ListItem key={i} data={item} />)
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
