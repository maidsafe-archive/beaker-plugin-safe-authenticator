import React, { Component } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import CreateAccountWelcome from './create_account_welcome';
import CreateAccountSecret from './create_account_secret';
import CreateAccountPassword from './create_account_password';

export default class CreateAccount extends Component {
  static propTypes = {};

  constructor() {
    super();
    this.currentNavState = 1;
  }

  render() {
    let container = null;
    switch (this.currentNavState) {
      case 1:
        container = <CreateAccountWelcome />;
        break;
      case 2:
        container = <CreateAccountSecret />;
        break;
      case 3:
        container = <CreateAccountPassword />;
        break;
      default:
        container = (
          <div>Oops!!</div>
        );
        break;
    }

    return (
      <div className="auth">
        <div className="auth-b">
          <div className="card create-acc">
            {container}
            <div className="intro-nav">
              <span className={classNames({ active: this.currentNavState === 1 })}>{''}</span>
              <span className={classNames({ active: this.currentNavState === 2 })}>{''}</span>
              <span className={classNames({ active: this.currentNavState === 3 })}>{''}</span>
            </div>
          </div>
          <div className="auth-foot">
            Already have a account? <Link to="/">Login</Link>
          </div>
        </div>
      </div>
    );
  }
}
