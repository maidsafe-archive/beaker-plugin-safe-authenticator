import React, { Component, PropTypes } from 'react';
import { Translate } from 'react-redux-i18n';
import Spinner from './spinner';
import Alert from './alert';
import NetworkStatus from './network_status';

export default class App extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    networkState: PropTypes.number,
    isAuthorised: PropTypes.bool,
    logout: PropTypes.func
  };

  constructor() {
    super();
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
      this.header.classList.add('fixed') : this.header.classList.remove('fixed');
  }

  /* eslint-disable class-methods-use-this */
  alertOnClick(res) {
    /* eslint-enable class-methods-use-this */
    console.warn('Alert :: ', res);
  }

  render() {
    const { networkState, isAuthorised, logout } = this.props;

    return (
      <div className="root">
        <header
          ref={(c) => {
            this.header = c;
          }}
        >
          <div className="header-cntr">
            <section className="lt">
              <div className="safe-auth-logo">{' '}</div>
              <div className="safe-auth-title"><Translate value="AppTitle" /></div>
            </section>
            {
              isAuthorised ? (
                <section className="rt">
                  <div className="rt-i"><NetworkStatus status={networkState} message={'Connected'} /></div>
                  <div className="rt-i btn-i">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        logout();
                      }}
                    >Logout
                    </button>
                  </div>
                </section>
                ) : null
            }
          </div>
        </header>
        <main className="root-cntr">
          {this.props.children}
        </main>
        <Spinner show={false} />
        <Alert show={false} message={'hello world'} title={'Test message'} onClick={this.alertOnClick} />
      </div>
    );
  }
}
