/* eslint-disable no-underscore-dangle */
import React, { Component } from 'react';
import i18n from 'i18n';

export default class Login extends Component {
  static propTypes = {};

  render() {
    return (
      <div className="auth">
        <div className="auth-b">
          <div className="card login">
            <h3 className="heading md">Login</h3>
            <div className="form">
              <form>
                <div className="form-grp">
                  <input type="password" name="secret" required="required" />
                  <label htmlFor="secret">{i18n.__('Account Secret')}</label>
                  <span className="msg">test message</span>
                  <span className="eye-opt">{' '}</span>
                </div>
                <div className="form-grp">
                  <input type="password" name="password" required="required" />
                  <label htmlFor="secret">{i18n.__('Account Password')}</label>
                  <span className="eye-opt">{' '}</span>
                </div>
                <div className="form-grp">
                  <button type="submit" className="btn flat primary">{i18n.__('Login')}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
