import React, { Component, PropTypes } from 'react';
import Spinner from './spinner';
import ListItem from './app_list_item';

export default class AppList extends Component {
  static propTypes = {
    fetchingApps: PropTypes.bool.isRequired,
    loading: PropTypes.bool,
    authorisedApps: PropTypes.shape,
    getAuthorisedApps: PropTypes.func,
    revokeApp: PropTypes.func
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor() {
    super();
    this.setFixedHeader = this.setFixedHeader.bind(this);
    this.getContainer = this.getContainer.bind(this);
  }

  componentDidMount() {
    this.props.getAuthorisedApps();
    window.addEventListener('scroll', this.setFixedHeader);
  }

  componentWillUpdate(nextProps) {
    if (!nextProps.isAuthorised) {
      return this.context.router.push('/login');
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.setFixedHeader);
  }

  setFixedHeader() {
    return (window.scrollY > 10) ?
      this.titlebar.classList.add('fixed') : this.titlebar.classList.remove('fixed');
  }

  getContainer() {
    const { fetchingApps, authorisedApps, revokeApp } = this.props;
    if (fetchingApps) {
      return <ListItem loading />;
    } else if (authorisedApps.length === 0) {
      return <ListItem isDefault />;
    }
    return authorisedApps.map((item, i) =>
      <ListItem key={i} data={item} revokeApp={revokeApp} />);
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
                this.getContainer()
              }
            </div>
          </div>
        </div>
        <Spinner show={this.props.loading} />
      </div>
    );
  }
}
