import React, { Component, PropTypes } from 'react';
import { Translate } from 'react-redux-i18n';
import Spinner from '../components/spinner';
import Alert from '../components/alert';
import NetworkStatus from '../components/network_status';

export default class App extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired
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
            <section className="rt">
              <div className="rt-i"><NetworkStatus status={1} message={'Connected'} /></div>
            </section>
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
