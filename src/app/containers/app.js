import React, { Component, PropTypes } from 'react';
import Spinner from '../components/spinner';
import Alert from '../components/alert';

export default class App extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired
  };

  /* eslint-disable class-methods-use-this */
  alertOnClick(res) {
    /* eslint-enable class-methods-use-this */
    console.warn('Alert :: ', res);
  }

  render() {
    return (
      <div className="root">
        <header>
          <div className="header-cntr">
            <div className="safe-auth-logo">{' '}</div>
            <div className="safe-auth-title">SAFE Authenticator</div>
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
