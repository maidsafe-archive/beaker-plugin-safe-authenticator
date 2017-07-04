import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

import CardLoaderFull from './card_loader_full';

export default class Login extends Component {
  static propTypes = {
    isAuthorised: PropTypes.bool,
    loading: PropTypes.bool,
    error: PropTypes.string,
    login: PropTypes.func,
    clearError: PropTypes.func
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor() {
    super();
    this.title = 'Sign in to manage your apps';
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    if (this.props.isAuthorised) {
      return this.context.router.push('/');
    }
    if (this.props.error) {
      this.props.clearError();
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.secretEle.focus();
    }, 100);
  }

  componentWillUpdate(nextProps) {
    if (nextProps.isAuthorised) {
      return this.context.router.push('/');
    }
  }

  togglePassword(e) {
    const input = e.target.parentElement.childNodes.item('input');
    if (!(input && input.value)) {
      return;
    }
    input.type = (input.type === 'text') ? 'password' : 'text';
  }

  handleSubmit(e) {
    e.preventDefault();
    const { login, clearError } = this.props;
    clearError();
    const secret = this.secretEle.value.trim();
    const password = this.passwordEle.value.trim();
    if (!secret || !password) {
      return;
    }
    login(secret, password);
  }

  render() {
    const { error } = this.props;

    // if (loading) {
    //   return <AuthLoader cancelAuthReq={clearAuthLoader} />;
    // }

    return (
      <div>
        <div className="card-main-b">
          <div className="card-main-h">{this.title}</div>
          <div className="card-main-cntr">
            {this.props.loading &&
            <CardLoaderFull msg="Signing in, please wait!">{''}</CardLoaderFull>
            }
            <div className="auth">
              <div className="auth-b login-b">
                <div className="auth-form">
                  <form onSubmit={this.handleSubmit}>
                    <div className="inp-grp">
                      <input
                        type="password"
                        id="acc-secret"
                        name="acc-secret"
                        ref={(c) => { this.secretEle = c; }}
                        required
                      />
                      <label htmlFor="acc-secret">Account Secret</label>
                      <span className="msg error">{ error }</span>
                      <button
                        type="button"
                        tabIndex="-1"
                        className="eye-btn"
                        onClick={this.togglePassword}
                      >{' '}</button>
                    </div>
                    <div className="inp-grp">
                      <input
                        type="password"
                        id="acc-password"
                        name="acc-password"
                        ref={(c) => { this.passwordEle = c; }}
                        required
                      />
                      <label htmlFor="acc-password">Account Password</label>
                      <button
                        type="button"
                        tabIndex="-1"
                        className="eye-btn"
                        onClick={this.togglePassword}
                      >{' '}</button>
                    </div>
                    <div className="btn-grp">
                      <button type="submit" className="btn primary long">Log in</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-f">
          Don&lsquo;t have an account? <Link
            className={classNames({ disabled: this.props.loading })}
            onClick={(e) => {
              e.preventDefault();
              if (this.props.loading) {
                return;
              }
              return this.context.router.push('create-account');
            }}
          >CREATE ACCOUNT</Link>
        </div>
      </div>
    );
  }
}
