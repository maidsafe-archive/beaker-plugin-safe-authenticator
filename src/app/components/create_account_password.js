import React, { Component } from 'react';
import { Translate } from 'react-redux-i18n';

export default class CreateAccountPassword extends Component {
  static propTypes = {
  };

  render() {
    return (
      <div>
        <h3 className="heading md"><Translate value="Account Password" /></h3>
        <div className="intro">
          <div className="intro-cnt">
            <Translate value="AuthIntro.desc.password" />
          </div>
          <div className="intro-cnt">
            <div className="form intro-form">
              <form>
                <div className="form-grp">
                  <input type="password" name="password" required="required" />
                  <label htmlFor="password"><Translate value="Account Password" /></label>
                  <span className="msg">test message</span>
                  <span className="eye-opt">{' '}</span>
                </div>
                <div className="form-grp">
                  <input type="password" name="cPassword" required="required" />
                  <label htmlFor="cPassword"><Translate value="Confirm Account Password" /></label>
                  <span className="eye-opt">{' '}</span>
                </div>
              </form>
            </div>
          </div>
          <div className="intro-foot">
            <button className="btn intro-foot-lt">Back</button>
            <button className="btn intro-foot-rt">Create Account</button>
          </div>
        </div>
      </div>
    );
  }
}
